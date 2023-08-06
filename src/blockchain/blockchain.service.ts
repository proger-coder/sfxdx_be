/* eslint-disable */
import { Injectable } from '@nestjs/common';
import Web3 from 'web3';
import ContractABI from '../../ContractABI.json';
import { PrismaService } from 'nestjs-prisma';
import { OrderType } from '@prisma/client';

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

    //const eventSubscription = this.contract.events.OrderCreated({ fromBlock: 'latest' }); // существует
    // console.log(this.contract.events.OrderCreated.toString()); // существует
    // console.log(eventSubscription); // выводится
    // console.log(eventSubscription instanceof EventEmitter) // falles
    // console.log(Object.getOwnPropertyNames(eventSubscription));
    const orderCreated = this.contract.events.OrderCreated({ fromBlock: 'latest' });
    const orderMatched = this.contract.events.OrderMatched({ fromBlock: 'latest' });
    const orderCancelled = this.contract.events.OrderCancelled({ fromBlock: 'latest' });

    // Подписка на событие OrderCreated
    orderCreated._emitter.on('data', async (event) => {
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
          isActive: true,
          orderType: isMarket ? ("MARKET" as OrderType) : ("LIMIT" as OrderType),
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

    // Подписка на событие OrderMatched
    this.contract.events
      .OrderMatched({ fromBlock: 'latest' })
      ._emitter.on('data', (event) =>
        console.log('Order Matched event: \n', event),
      )
      .on('error', console.error);

    // Подписка на событие OrderCancelled
    this.contract.events
      .OrderCancelled({ fromBlock: 'latest' })
      ._emitter.on('data', (event) =>
        console.log('Order Cancelled event: \n', event),
      )
      .on('error', console.error);
  }

  /** создание заявки */
  async createOrder(
    tokenA: string,
    tokenB: string,
    amountA: number,
    amountB: number,
  ) {
    const createOrder = this.contract.methods.createOrder(
      tokenA,
      tokenB,
      amountA,
      amountB,
    );
    const gas = await createOrder.estimateGas({
      from: this.web3.eth.defaultAccount,
    });
    const data = createOrder.encodeABI();
    const gasHex = this.web3.utils.toHex(gas);
    const gasPrice = await this.web3.eth.getGasPrice();
    const tx = {
      from: this.web3.eth.defaultAccount,
      to: CONTRACT_ADDRESS,
      data,
      gas: gasHex,
      gasPrice,
    };

    const signedTransaction = await this.web3.eth.accounts.signTransaction(
      tx,
      privateKey,
    );
    const receipt = await this.web3.eth.sendSignedTransaction(
      signedTransaction.rawTransaction,
    );

    console.log('receipt blockHash = ', receipt?.blockHash);
    // Преобразование 'BigInt' в 'string'
    return JSON.parse(
      JSON.stringify(receipt, (_, v) =>
        typeof v === 'bigint' ? v.toString() : v,
      ),
    );
  }

  async cancelOrder(orderId: number) {
    const cancelOrder = this.contract.methods.cancelOrder(orderId);
    const gas = await cancelOrder.estimateGas({
      from: this.web3.eth.defaultAccount,
    });
    const data = cancelOrder.encodeABI();
    const tx = {
      from: this.web3.eth.defaultAccount,
      to: CONTRACT_ADDRESS,
      data,
      gas,
    };

    const signedTransaction = await this.web3.eth.accounts.signTransaction(
      tx,
      privateKey,
    );
    const receipt = await this.web3.eth.sendSignedTransaction(
      signedTransaction.rawTransaction,
    );
    return receipt;
  }

  async matchOrders(
    matchedOrderIds,
    tokenA,
    tokenB,
    amountA,
    amountB,
    isMarket,
  ) {
    // Создаем экземпляр функции matchOrders из смарт-контракта
    const matchOrdersFunction = this.contract.methods.matchOrders(
      matchedOrderIds,
      tokenA,
      tokenB,
      amountA,
      amountB,
      isMarket,
    );

    // Оценка газа, который потребуется для транзакции
    const gas = await matchOrdersFunction.estimateGas({
      from: this.web3.eth.defaultAccount,
    });

    // Кодировка ABI для передачи в транзакцию
    const data = matchOrdersFunction.encodeABI();
    const gasHex = this.web3.utils.toHex(gas);
    const gasPrice = await this.web3.eth.getGasPrice();

    // Создание объекта транзакции
    const tx = {
      from: this.web3.eth.defaultAccount,
      to: CONTRACT_ADDRESS,
      data,
      gas: gasHex,
      gasPrice,
    };

    // Подписание транзакции
    const signedTransaction = await this.web3.eth.accounts.signTransaction(
      tx,
      privateKey,
    );

    // Отправка подписанной транзакции
    const receipt = await this.web3.eth.sendSignedTransaction(
      signedTransaction.rawTransaction,
    );

    console.log('receipt blockHash = ', receipt?.blockHash);
    // Преобразование 'BigInt' в 'string'
    return JSON.parse(
      JSON.stringify(receipt, (_, v) =>
        typeof v === 'bigint' ? v.toString() : v,
      ),
    );
  }
}
