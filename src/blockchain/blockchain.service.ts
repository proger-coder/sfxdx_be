/* eslint-disable */
import { Injectable } from '@nestjs/common';
import Web3 from 'web3';
import ContractABI from '../../ContractABI.json';
import { PrismaService } from 'nestjs-prisma';
import { OrderType, OrderStatus } from '@prisma/client';
import * as fs from "fs";

const privateKey = process.env.ETH_GENERRED_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const GOERLI_INFURA_WSS = process.env.GOERLI_INFURA_WSS;
const contractDeployBlockNumber = Number(process.env.CONTRACT_DEPLOY_BLOCK_NUMBER);

// tokenA - адрес токена покупки, tokenB - адрес токена продажи

@Injectable()
export class BlockchainService {
  private web3: Web3;
  private readonly contract: any;
  private readonly lastProcessedBlock: number; // Блок, с которого начинать обработку

    constructor(private prisma: PrismaService) {
      this.web3 = new Web3(
        new Web3.providers.WebsocketProvider(GOERLI_INFURA_WSS),
      );
      this.contract = new this.web3.eth.Contract(ContractABI, CONTRACT_ADDRESS);
      //Грузим блок для начала обработки - либо из файла, либо из хардкода
      this.lastProcessedBlock = this.getLastProcessedBlock() || contractDeployBlockNumber;
    }

  async handleOrderCreated(event) {
    const { id, user, tokenA, tokenB, amountA, amountB, isMarket } = event.returnValues;
    console.log('Order Created event with id=', id);

    try {
      const orderData = {
        id: `${id}`,
        creatorAddress: user,
        tokenA,
        tokenB,
        amountA: `${amountA}`,
        amountB: `${amountB}`,
        amountLeftToFill: `${amountA}`, // Осталось докупить
        orderType: isMarket ? ("MARKET" as OrderType) : ("LIMIT" as OrderType),
        cancelable: !isMarket // возможность отмены - только для активных или частично заполненных лимитных ордеров
      };

      const createdOrder = await this.prisma.order.create({
        data: orderData,
      });
      console.log('Order saved to database:', createdOrder);
      this.setLastProcessedBlock(event.blockNumber); // устанавливаем последний обработанный блок
    } catch (error) {
      console.error('Error saving order to database:', error);
    }
  }

  async handleOrderCancelled(event) {
    const id = event.returnValues.id.toString();
    console.log('Order Cancelled event with id=', id);

    try {
      const filledOrder = await this.prisma.order.update({
        where: { id },
        data: {
          orderStatus: "CANCELLED",
          cancelable: false // отменённый ордер становится неотменяемым
        }
      });
      console.log(`Result of cancelling order ${id} = `, filledOrder['orderStatus']);
      this.setLastProcessedBlock(event.blockNumber); // устанавливаем последний обработанный блок
    } catch (e) {
      console.log(`Error trying update order status where id = ${id} :`, e);
    }
  }

  async handleOrderMatched(event) {
    const id = event.returnValues.id.toString();
    const amountLeftToFill = event.returnValues.amountLeftToFill.toString();
    console.log('Order Matched event with id=', id);

    let orderStatus: OrderStatus;
    let cancelable = true;
    if (amountLeftToFill === '0') {  // Если ордер полностью исполнен
      orderStatus = "FILLED";
      cancelable = false;
    } else {
      orderStatus = "PARTIALLY_FILLED";
    }

    try {
      const updatedOrder = await this.prisma.order.update({
        where: { id },
        data: {
          orderStatus,
          amountLeftToFill: amountLeftToFill,
          cancelable // выполненный полностью ордер становится неотменяемым
        }
      });
      console.log(`Order ${id} updated with status:`, updatedOrder.orderStatus);
      this.setLastProcessedBlock(event.blockNumber); // устанавливаем последний обработанный блок
    } catch (e) {
      console.log(`Error updating order status where id = ${id} :`, e);
    }
  }

  // Подключаемся к аккаунту
  async setAccount(privateKey: string) {
    const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
    this.web3.eth.accounts.wallet.add(account);
    this.web3.eth.defaultAccount = account.address;
  }

  /** Обработка событий с некоего момента (блока) */
  async processPastEvents(fromBlock: number) {
    const pastCreatedEvents = await this.contract.getPastEvents('OrderCreated', { fromBlock });

    for (let event of pastCreatedEvents) {
      await this.handleOrderCreated(event);
      console.log('Handling event from past: OrderCreated , id=', event.returnValues.id);
    }

    const pastCancelledEvents = await this.contract.getPastEvents('OrderCancelled', { fromBlock });
    for (let event of pastCancelledEvents) {
      await this.handleOrderCancelled(event);
      console.log('Handling event from past: OrderCancelled , id=', event.returnValues.id);
    }

    const pastMatchedEvents = await this.contract.getPastEvents('OrderMatched', { fromBlock });
    for (let event of pastMatchedEvents) {
      await this.handleOrderMatched(event);
      console.log('Handling event from past: OrderMatched , id=', event.returnValues.id);
    }
  }

  setLastProcessedBlock(blockNumber) {
    fs.writeFileSync('lastProcessedBlock.txt', blockNumber.toString());
  }

  getLastProcessedBlock(){
    if (fs.existsSync('lastProcessedBlock.txt')) {
    const data = fs.readFileSync('lastProcessedBlock.txt', 'utf8');
    return parseInt(data);
    } else {
      // Если файла нет - вернуть номер блока развертывания контракта
      return contractDeployBlockNumber || 7722460;
    }
  }

  async init() {
    await this.setAccount(privateKey);
    console.log('account set');

    this.web3.provider.on('connect', () => {
      console.log('connect');
    });

    // Грузим последний известный блок из хранилища данных (если он там есть)
    await this.processPastEvents(this.lastProcessedBlock);
    //await this.processPastEvents(9473177)

    /** подписки на свежие события */
    const orderCreated = this.contract.events.OrderCreated({ fromBlock: 'latest' })._emitter;
    const orderCancelled = this.contract.events.OrderCancelled({ fromBlock: 'latest' })._emitter;
    const orderMatched = this.contract.events.OrderMatched({ fromBlock: 'latest' })._emitter;

    /** Подписка на событие OrderCreated и запись ордера в БД */
    orderCreated.on('data', this.handleOrderCreated.bind(this)).on('error', console.error);

    /** Подписка на событие OrderCancelled и изменение статуса ордера на FILLED в БД */
    orderCancelled.on('data', this.handleOrderCancelled.bind(this)).on('error', console.error);

    /** Подписка на событие OrderMatched. Если весь объем заявки был исполнен, заявка считается закрытой.*/
    orderMatched.on('data', this.handleOrderMatched.bind(this)).on('error', console.error);

  }

  /**
   * Обобщённая функция контракта
   * Выполняет переданный метод смарт-контракта.
   *
   * @param {string} methodFunction - Название метода контракта для выполнения.
   * @param {...any} args - Аргументы, которые должны быть переданы методу контракта.
   * @returns {Promise<string>} - Возвращает обработанный ответ от транзакции в формате строки.
   */
  private async executeContractMethod(methodFunction, ...args) {
    // Создаём экземпляр функции смарт-контракта с переданными аргументами.
    const contractFunction = this.contract.methods[methodFunction](...args);

    // Оцениваем необходимое количество газа для выполнения транзакции.
    const gas = await contractFunction.estimateGas({
      from: this.web3.eth.defaultAccount,
    });

    // Кодируем ABI функции для последующей передачи его в транзакцию.
    const data = contractFunction.encodeABI();

    // Конвертируем оценочное значение газа в формат "hex".
    const gasHex = this.web3.utils.toHex(gas);

    // Получаем текущую цену газа на рынке.
    const gasPrice = await this.web3.eth.getGasPrice();

    // Формируем объект транзакции с необходимыми параметрами.
    const tx = {
      from: this.web3.eth.defaultAccount,
      to: CONTRACT_ADDRESS,
      data,
      gas: gasHex,
      gasPrice,
    };

    // Подписываем созданную транзакцию с помощью приватного ключа.
    const signedTransaction = await this.web3.eth.accounts.signTransaction(
      tx,
      privateKey,
    );

    // Отправляем подписанную транзакцию в сеть.
    const receipt = await this.web3.eth.sendSignedTransaction(
      signedTransaction.rawTransaction,
    );

    // Выводим хэш блока, в котором была включена транзакция.
    console.log('receipt blockHash = ', receipt?.blockHash);

    // Возвращаем результат выполнения транзакции в формате строки (преобразуя из 'BigInt', если это необходимо).
    return this.jsonify(receipt);
  }

  /** сравнение заявок */
  async matchOrders(matchedOrderIds: string[], tokenA, tokenB, amountA, amountB, isMarket) {
    return await this.executeContractMethod('matchOrders', matchedOrderIds, tokenA, tokenB, amountA, amountB, isMarket);
  }

  /** Создание заявки в контракте */
  async createOrder(tokenA: string, tokenB: string, amountA: number, amountB: number) {
    return await this.executeContractMethod('createOrder', tokenA, tokenB, amountA, amountB);
  }

  /** Отмена заявки в контракте */
  async cancelOrder(orderId: string) {
    return await this.executeContractMethod('cancelOrder', orderId);
  }

  // Преобразование 'BigInt' в 'string'
  jsonify(receipt){
    return JSON.parse(
      JSON.stringify(receipt, (_, v) =>
        typeof v === 'bigint' ? v.toString() : v,
      ),
    );
  }
}

// orderCreated.on('data', async (event) => {
//     const { id, user, tokenA, tokenB, amountA, amountB, isMarket } = event.returnValues;
//     console.log('Order Created event: \n', event, 'id=', id);
//
//   try {
//     const orderData = {
//       id: `${id}`,
//       creatorAddress: user,
//       tokenA,
//       tokenB,
//       amountA: `${amountA}`,
//       amountB: `${amountB}`,
//       amountLeftToFill: `${amountA}`, // Осталось докупить
//       orderType: isMarket ? ("MARKET" as OrderType) : ("LIMIT" as OrderType),
//       cancelable: !isMarket // возможность отмены - только для активных или частично заполненных лимитных ордеров
//     };
//
//     const createdOrder = await this.prisma.order.create({
//       data: orderData,
//     });
//     console.log('Order saved to database:', createdOrder);
//   } catch (error) {
//       console.error('Error saving order to database:', error);
//     }
//   })
//   .on('error', console.error);

// orderCancelled.on('data', async (event) => {
//   //const { id } = event.returnValues;
//   const id = event.returnValues.id.toString(); // т.к. bigint
//   console.log('Order Cancelled event: \n', event)
//   try {
//     const filledOrder = await this.prisma.order.update({
//       where: { id },
//       data: {
//         orderStatus: "CANCELLED",
//         cancelable: false // отменённый ордер становится неотменяемым
//       }
//     });
//     console.log(`Result of cancelling order ${id} = `, filledOrder['orderStatus'])
//   } catch (e) {
//     console.log(`Error trying update order status where id = ${id} :`, e)
//   }
// })
//   .on('error', console.error);

// orderMatched.on('data', async (event) => {
//   //const { id, amountLeftToFill } = event.returnValues;
//   const id = event.returnValues.id.toString(); // т.к. bigint
//   const amountLeftToFill = event.returnValues.amountLeftToFill.toString(); // тоже Бигинт
//
//   console.log('Order Matched event: \n', event);
//
//   let orderStatus: OrderStatus;
//   let cancelable = true;
//   if (amountLeftToFill === '0') {  // Если ордер полностью исполнен
//     orderStatus = "FILLED";
//     cancelable = false;
//
//   } else {
//     orderStatus = "PARTIALLY_FILLED";
//   }
//
//   try {
//     const updatedOrder = await this.prisma.order.update({
//       where: { id },
//       data: {
//         orderStatus,
//         amountLeftToFill: amountLeftToFill,
//         cancelable // выполненный полностью ордер становится неотменяемым
//       }
//     });
//     console.log(`Order ${id} updated with status:`, updatedOrder.orderStatus);
//   } catch (e) {
//     console.log(`Error updating order status where id = ${id} :`, e);
//   }
// })
//   .on('error', console.error);