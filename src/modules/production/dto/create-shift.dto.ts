import { IsNotEmpty, IsString, IsEnum, IsDateString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ShiftName } from '../../../entities/enums';

export class CreateShiftDto {
  @ApiProperty({ example: '2026-07-29T00:00:00.000Z', description: 'Ngày làm việc' })
  @IsNotEmpty({ message: 'Ngày không được để trống' })
  @IsDateString({}, { message: 'Định dạng ngày không hợp lệ' })
  date: string;

  @ApiProperty({ enum: ShiftName, example: 'C1', description: 'Ca làm việc (C1, C2, C3)' })
  @IsNotEmpty({ message: 'Ca không được để trống' })
  @IsEnum(ShiftName, { message: 'Ca làm việc phải là C1, C2 hoặc C3' })
  shift: ShiftName;

  @ApiProperty({ example: 'dept-id-here', description: 'ID Khâu (Phòng ban)' })
  @IsNotEmpty({ message: 'Khâu không được để trống' })
  @IsString()
  departmentId: string;

  @ApiProperty({ example: 'machine-id-here', description: 'ID Máy/Chuyền' })
  @IsNotEmpty({ message: 'Máy/Chuyền không được để trống' })
  @IsString()
  machineId: string;

  @ApiProperty({ example: ['worker-1-id', 'worker-2-id'], description: 'Danh sách ID công nhân làm chung máy' })
  @IsArray({ message: 'Danh sách công nhân phải là một mảng' })
  @IsString({ each: true, message: 'ID công nhân phải là chuỗi' })
  workerIds: string[];
}
