import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetOrdersDto {
  @ApiProperty({ description: 'Токен A', required: false })
  @IsOptional()
  @IsString()
  tokenA?: string;

  @ApiProperty({ description: 'Токен B', required: false })
  @IsOptional()
  @IsString()
  tokenB?: string;

  @ApiProperty({ description: 'Адрес пользователя', required: false })
  @IsOptional()
  @IsString()
  user?: string;

  @ApiProperty({ description: 'Активный ли заказ', required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}