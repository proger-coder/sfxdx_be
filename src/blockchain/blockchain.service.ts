import { Injectable } from '@nestjs/common';
import Web3 from 'web3';
import ContractABI from '../../ContractABI.json';
import { PrismaService } from 'nestjs-prisma';

const privateKey = process.env.ETH_GENERRED_PRIVATE_KEY || '';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const INFURA_URL = process.env.GOERLI_INFURA_URL;

@Injectable()
export class BlockchainService {
  private web3: Web3;
  private contract: any;

  constructor(private prisma: PrismaService) {
    this.web3 = new Web3(INFURA_URL);
    this.contract = new this.web3.eth.Contract(ContractABI, CONTRACT_ADDRESS);
  }

  async init() {
    await this.setAccount(privateKey);

    this.contract.on('OrderCreated', async (order) => {
      console.log('OrderCreated', order);
      // Создать новый заказ в базе данных
      // await this.prisma.order.create({
      //   data: {
      //     // Заполните данные заказа на основе полученного объекта order
      //   },
      // });
    });

    this.contract.on('OrderMatched', async (orderId, event) => {
      console.log('OrderMatched', orderId);
      // Найти заказ в базе данных и обновить его
      // await this.prisma.order.update({
      //   where: { id: orderId },
      //   data: {
      //     // Обновить данные заказа на основе полученного объекта event
      //   },
      // });
    });

    this.contract.on('OrderCancelled', async (orderId) => {
      console.log('OrderCancelled', orderId);
      // Найти заказ в базе данных и обновить его
      // await this.prisma.order.update({
      //   where: { id: orderId },
      //   data: {
      //     // Обновить данные заказа на основе полученного объекта event
      //   },
      // });
    });
  }

  // Подключаемся к аккаунту
  async setAccount(privateKey: string) {
    const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
    this.web3.eth.accounts.wallet.add(account);
    this.web3.eth.defaultAccount = account.address;
  }

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
    const gasHex = this.web3.utils.toHex(gas);
    const data = createOrder.encodeABI();
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
    console.log(receipt);
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

  async matchOrders(orderId: number, oppositeOrders: number[]) {
    const matchOrders = this.contract.methods.matchOrders(
      orderId,
      oppositeOrders,
    );
    const gas = await matchOrders.estimateGas({
      from: this.web3.eth.defaultAccount,
    });
    const data = matchOrders.encodeABI();
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
}
