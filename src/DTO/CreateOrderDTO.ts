import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: 'Токен A', required: true })
  @IsNotEmpty()
  @IsString()
  readonly tokenA: string;

  @ApiProperty({ description: 'Токен B', required: true })
  @IsNotEmpty()
  @IsString()
  readonly tokenB: string;

  @ApiProperty({ description: 'Количество токена A', required: true })
  @IsNotEmpty()
  @IsNumber()
  readonly amountA: number;

  @ApiProperty({ description: 'Количество токена B', required: true })
  @IsNotEmpty()
  @IsNumber()
  readonly amountB: number;
}

