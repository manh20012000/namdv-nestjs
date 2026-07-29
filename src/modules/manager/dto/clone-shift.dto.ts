import { IsNotEmpty, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ShiftName } from '../../../entities/enums';

export class CloneShiftDto {
  @ApiProperty({ example: '2026-07-30T00:00:00.000Z', description: 'Ngày cần sao chép sang' })
  @IsNotEmpty()
  @IsDateString()
  targetDate: string;

  @ApiProperty({ enum: ShiftName, example: 'C2', description: 'Ca cần sao chép sang' })
  @IsNotEmpty()
  @IsEnum(ShiftName)
  targetShift: ShiftName;
}
