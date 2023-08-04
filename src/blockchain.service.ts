import { Injectable } from '@nestjs/common';
import Web3 from 'web3';
import ContractABI from '../ContractABI.json';

@Injectable()
export class BlockchainService {
  private readonly web3: Web3;
  private readonly contract: any; // тип можно улучшить в зависимости от используемого web3.js типа

  constructor() {
    this.web3 = new Web3(process.env.GOERLI_INFURA_URL);
    this.contract = new this.web3.eth.Contract(
      ContractABI,
      process.env.CONTRACT_ADDRESS,
    );
  }

  // Ваши методы для взаимодействия с контрактом и слушания событий
}
