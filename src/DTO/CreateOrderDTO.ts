import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  readonly tokenA: string;

  @IsNotEmpty()
  @IsString()
  readonly tokenB: string;

  @IsNotEmpty()
  @IsNumber()
  readonly amountA: number;

  @IsNotEmpty()
  @IsNumber()
  readonly amountB: number;
}
