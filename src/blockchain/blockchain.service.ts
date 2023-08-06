/* eslint-disable */
import { Injectable } from '@nestjs/common';
import Web3 from 'web3';
import ContractABI from '../../ContractABI.json';
import { PrismaService } from 'nestjs-prisma';
import { OrderType, OrderStatus } from '@prisma/client';

const privateKey = process.env.ETH_GENERRED_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const GOERLI_INFURA_WSS = process.env.GOERLI_INFURA_WSS;

@Injectable()
export class BlockchainService {
  private web3: Web3;
  private readonly contract: any;

  constructor(private prisma: PrismaService) {
    this.web3 = new Web3(
      new Web3.providers.WebsocketProvider(GOERLI_INFURA_WSS),
    );
    this.contract = new this.web3.eth.Contract(ContractABI, CONTRACT_ADDRESS);
  }

  // Преобразование 'BigInt' в 'string'
  jsonify(receipt){
    return JSON.parse(
      JSON.stringify(receipt, (_, v) =>
        typeof v === 'bigint' ? v.toString() : v,
      ),
    );
  }

  // Подключаемся к аккаунту
  async setAccount(privateKey: string) {
    const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
    this.web3.eth.accounts.wallet.add(account);
    this.web3.eth.defaultAccount = account.address;
  }

  async init() {
    await this.setAccount(privateKey);
    console.log('account set');

    this.web3.provider.on('connect', () => {
      console.log('connect');
    });

    const orderCreated = this.contract.events.OrderCreated({ fromBlock: 'latest' })._emitter;
    const orderCancelled = this.contract.events.OrderCancelled({ fromBlock: 'latest' })._emitter;
    const orderMatched = this.contract.events.OrderMatched({ fromBlock: 'latest' })._emitter;

    /** Подписка на событие OrderCreated и запись ордера в БД */
    orderCreated.on('data', async (event) => {
        const { id, user, tokenA, tokenB, amountA, amountB, isMarket } = event.returnValues;
        console.log('Order Created event: \n', event, 'id=', id);

      try {
        const orderData = {
          id: `${id}`,
          creatorAddress: user,
          tokenA,
          tokenB,
          amountA: `${amountA}`,
          amountB: `${amountB}`,
          orderType: isMarket ? ("MARKET" as OrderType) : ("LIMIT" as OrderType),
          cancelable: !isMarket // возможность отмены - только для активных или частично заполненных лимитных ордеров
        };

        const createdOrder = await this.prisma.order.create({
          data: orderData,
        });
        console.log('Order saved to database:', createdOrder);
      } catch (error) {
          console.error('Error saving order to database:', error);
        }
      })
      .on('error', console.error);

    /** Подписка на событие OrderCancelled и изменение статуса ордера на FILLED в БД */
    orderCancelled.on('data', async (event) => {
      //const { id } = event.returnValues;
      const id = event.returnValues.id.toString(); // т.к. bigint
      console.log('Order Cancelled event: \n', event)
      try {
        const filledOrder = await this.prisma.order.update({
          where: { id },
          data: {
            orderStatus: "CANCELLED",
            cancelable: false // отменённый ордер становится неотменяемым
          }
        });
        console.log(`Result of cancelling order ${id} = `, filledOrder['orderStatus'])
      } catch (e) {
        console.log(`Error trying update order status where id = ${id} :`, e)
      }
    })
      .on('error', console.error);

    /** Подписка на событие OrderMatched и ...*/
    // Если весь объем заявки был исполнен (то есть amount равен amountLeftToFill), заявка считается закрытой.
    orderMatched.on('data', async (event) => {
      const { id, amountLeftToFill } = event.returnValues;
      console.log('Order Matched event: \n', event);

      let orderStatus: OrderStatus;
      if (amountLeftToFill === '0') {  // Если ордер полностью исполнен
        orderStatus = "FILLED";
      } else {
        orderStatus = "PARTIALLY_FILLED";
      }

      try {
        const updatedOrder = await this.prisma.order.update({
          where: { id },
          data: {
            orderStatus,
            amountLeftToFill: amountLeftToFill
          }
        });
        console.log(`Order ${id} updated with status:`, updatedOrder.orderStatus);
      } catch (e) {
        console.log(`Error updating order status where id = ${id} :`, e);
      }
    })
      .on('error', console.error);
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




}
