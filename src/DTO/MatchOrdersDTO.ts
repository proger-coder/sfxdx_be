import {
  IsArray,
  IsString,
  IsNumber,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MatchOrdersDto {
  @ApiProperty({
    description: 'Список идентификаторов ордеров для сопоставления',
    type: [String],
    required: true
  })
  @IsArray()
  @IsString({ each: true })
  matchedOrderIds: string[];

  @ApiProperty({ description: 'Токен A', required: true })
  @IsString()
  tokenA: string;

  @ApiProperty({ description: 'Токен B', required: true })
  @IsString()
  tokenB: string;

  @ApiProperty({ description: 'Количество токена A', required: true })
  @IsNumber()
  amountA: number;

  @ApiProperty({ description: 'Количество токена B', required: true })
  @IsNumber()
  amountB: number;

  @ApiProperty({ description: 'Является ли ордер рыночным', required: true })
  @IsBoolean()
  isMarket: boolean;
}
