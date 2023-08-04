import { IsOptional, IsBoolean, IsString } from 'class-validator';

export class GetOrdersDto {
  @IsOptional()
  @IsString()
  tokenA?: string;

  @IsOptional()
  @IsString()
  tokenB?: string;

  @IsOptional()
  @IsString()
  user?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
