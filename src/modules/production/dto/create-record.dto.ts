import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class MaterialUsageDto {
  @ApiProperty({ example: 'material-id', description: 'ID Vật tư' })
  @IsNotEmpty({ message: 'Vật tư không được để trống' })
  @IsString()
  materialId: string;

  @ApiProperty({ example: 100, description: 'Tồn đầu' })
  @IsNumber()
  @Min(0)
  initialStock: number;

  @ApiProperty({ example: 20, description: 'Nhập mới' })
  @IsNumber()
  @Min(0)
  newlyReceived: number;

  @ApiProperty({ example: 30, description: 'Tiêu hao thực tế' })
  @IsNumber()
  @Min(0)
  consumed: number;
}

class HandoverDto {
  @ApiProperty({ example: 'dept-id-khau-sau', description: 'ID Khâu nhận' })
  @IsNotEmpty()
  @IsString()
  targetDepartmentId: string;

  @ApiProperty({ example: 980, description: 'Số lượng bàn giao' })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ example: 'Nguyễn Văn B', description: 'Tên người nhận/Ký nhận' })
  @IsNotEmpty()
  @IsString()
  recipientName: string;
}

export class CreateRecordDto {
  @ApiProperty({ example: 'work-order-id', description: 'ID Lệnh sản xuất (LSX)' })
  @IsNotEmpty({ message: 'Lệnh sản xuất không được để trống' })
  @IsString()
  workOrderId: string;

  @ApiProperty({ example: 1000, description: 'Sản lượng đạt' })
  @IsNumber()
  @Min(0, { message: 'Sản lượng đạt không được âm' })
  quantityProduced: number;

  @ApiProperty({ example: 20, description: 'Hỏng do sản xuất (Via, Cục...)' })
  @IsNumber()
  @Min(0)
  scrapQuantity: number;

  @ApiProperty({ example: 5, description: 'Hỏng do nguyên nhân khác (Khâu trước...)' })
  @IsNumber()
  @Min(0)
  scrapOtherQuantity: number;

  @ApiProperty({ example: 480, description: 'Thời gian thực hiện (phút)' })
  @IsNumber()
  @Min(1)
  productionTime: number;

  @ApiProperty({ example: 'Nguyên nhân hao phí...', required: false, description: 'Ghi chú/Lý do hao phí' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [MaterialUsageDto], description: 'Danh sách vật tư sử dụng' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialUsageDto)
  materials: MaterialUsageDto[];

  @ApiProperty({ type: [HandoverDto], required: false, description: 'Thông tin bàn giao khâu tiếp theo' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HandoverDto)
  handovers?: HandoverDto[];
}
