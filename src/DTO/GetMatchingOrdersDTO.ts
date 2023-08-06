import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

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
  //amountA: number;

  @IsNotEmpty()
  @IsString()
  amountB: string;
  //amountB: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true', { toClassOnly: true })
  //isMarket: string;
  isMarket: boolean;
}
