import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class GetMatchingOrdersDto {
  @IsNotEmpty()
  @IsString()
  tokenA: string;

  @IsNotEmpty()
  @IsString()
  tokenB: string;

  @IsNotEmpty()
  @IsString()
  amountA: string;

  @IsNotEmpty()
  @IsString()
  amountB: string;

  @IsOptional()
  @IsBoolean()
  isMarket: boolean;
}
