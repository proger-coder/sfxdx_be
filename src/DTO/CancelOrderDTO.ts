import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelOrderDto {
  @ApiProperty({ description: 'Идентификатор ордера для отмены', required: true })
  @IsString()
  id: string;
}
