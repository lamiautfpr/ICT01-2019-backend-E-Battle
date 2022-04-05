import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export enum UserStatus {
  PENDING = 0,
  APPROVED = 1,
}

export class ApproveUserDto {
  @ApiProperty({
    description: 'ID do usuário',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  id: number;

  @ApiProperty({
    description: 'Novo status do usuário',
    enumName: 'UserStatus',
    enum: UserStatus,
  })
  @IsNotEmpty()
  @IsEnum(UserStatus)
  status: number;
}
