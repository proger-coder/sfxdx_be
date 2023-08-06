import {
  IsArray,
  IsString,
  IsNumber,
  IsBoolean,
  ValidateNested,
} from 'class-validator';

export class MatchOrdersDto {
  @IsArray()
  @IsString({ each: true })
  matchedOrderIds: string[];

  @IsString()
  tokenA: string;

  @IsString()
  tokenB: string;

  @IsNumber()
  amountA: number;

  @IsNumber()
  amountB: number;

  @IsBoolean()
  isMarket: boolean;
}
