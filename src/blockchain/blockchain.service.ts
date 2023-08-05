import { Injectable } from '@nestjs/common';
import Web3 from 'web3';
import ContractABI from '../ContractABI.json';
import { PrismaService } from 'nestjs-prisma';

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
    // const provider = new ethers.providers.InfuraProvider(network, infuraProjectId);
    // const contract = new ethers.Contract(contractAddress, ContractABI, provider);

    this.contract.on('OrderCreated', async (order) => {
      // Создать новый заказ в базе данных
      await this.prisma.order.create({
        data: {
          // Заполните данные заказа на основе полученного объекта order
        },
      });
    });

    this.contract.on('OrderMatched', async (orderId, event) => {
      // Найти заказ в базе данных и обновить его
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          // Обновить данные заказа на основе полученного объекта event
        },
      });
    });

    this.contract.on('OrderCancelled', async (orderId) => {
      // Найти заказ в базе данных и обновить его
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          // Обновить данные заказа на основе полученного объекта event
        },
      });
    });
  }
}

// Прослушивание событий
/*    this.contract.events.OrderCreated({fromBlock: 0}, (error, event) => {
      if (error) console.error(error);
      console.log(event);
    })
    .on('data', (event) => {
      // Здесь вы можете обрабатывать данные события
      console.log(event);
    })
    .on('changed', (event) => {
      // удаление события из локальной базы данных
    })
    .on('error', console.error);*/