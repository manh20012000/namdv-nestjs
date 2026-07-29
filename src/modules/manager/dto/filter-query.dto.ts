import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ShiftName, ShiftStatus } from '../../../entities/enums';

export class FilterQueryDto {
  @ApiProperty({ required: false, example: '2026-07-01', description: 'Từ ngày' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, example: '2026-07-31', description: 'Đến ngày' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false, description: 'ID Khâu (Department)' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiProperty({ required: false, enum: ShiftName, description: 'Ca (C1, C2, C3)' })
  @IsOptional()
  @IsEnum(ShiftName)
  shift?: ShiftName;

  @ApiProperty({ required: false, description: 'ID Người phụ trách' })
  @IsOptional()
  @IsString()
  leadUserId?: string;

  @ApiProperty({ required: false, description: 'ID Máy' })
  @IsOptional()
  @IsString()
  machineId?: string;

  @ApiProperty({ required: false, enum: ShiftStatus, description: 'Trạng thái' })
  @IsOptional()
  @IsEnum(ShiftStatus)
  status?: ShiftStatus;
}
