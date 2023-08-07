import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetMatchingOrdersDto {
  @ApiProperty({ description: 'Токен A', required: true })
  @IsNotEmpty()
  @IsString()
  tokenA: string;

  @ApiProperty({ description: 'Токен B', required: true })
  @IsNotEmpty()
  @IsString()
  tokenB: string;

  @ApiProperty({ description: 'Количество токена A', required: true })
  @IsNotEmpty()
  @IsString()
  amountA: string;

  @ApiProperty({ description: 'Количество токена B', required: true })
  @IsNotEmpty()
  @IsString()
  amountB: string;

  @ApiProperty({ description: 'Является ли ордер рыночным', required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true', { toClassOnly: true })
  isMarket: boolean;
}
