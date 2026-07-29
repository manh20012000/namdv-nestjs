import { Controller, Post, Get, Body, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '../../entities/enums';
import { ProductionService } from './production.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { CreateRecordDto } from './dto/create-record.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor';

@ApiTags('Nhập liệu Công nhân (Production)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Get('initial-stock')
  @Roles(Role.CONG_NHAN, Role.TO_TRUONG, Role.TRUONG_PHONG, Role.GIAM_DOC)
  @ApiOperation({ summary: 'Lấy tồn đầu của vật tư trên máy (từ tồn cuối ca trước)' })
  getInitialStock(
    @Query('machineId') machineId: string,
    @Query('materialId') materialId: string,
  ) {
    return this.productionService.getInitialStock(machineId, materialId);
  }

  @Post('shift')
  @Roles(Role.CONG_NHAN, Role.TO_TRUONG)
  @UseInterceptors(AuditLogInterceptor)
  @ApiOperation({ summary: 'Khởi tạo ca sản xuất mới hoặc lấy ca hiện tại nếu đã tạo (Header)' })
  createShift(@CurrentUser() user: any, @Body() dto: CreateShiftDto) {
    return this.productionService.createOrGetShift(user.id, dto);
  }

  @Post('shift/:id/record')
  @Roles(Role.CONG_NHAN, Role.TO_TRUONG)
  @UseInterceptors(AuditLogInterceptor)
  @ApiOperation({ summary: 'Thêm một Lệnh sản xuất chi tiết vào ca sản xuất' })
  addRecord(@Param('id') shiftId: string, @Body() dto: CreateRecordDto) {
    return this.productionService.addRecord(shiftId, dto);
  }

  @Post('shift/:id/complete')
  @Roles(Role.CONG_NHAN, Role.TO_TRUONG)
  @UseInterceptors(AuditLogInterceptor)
  @ApiOperation({ summary: 'Hoàn thành và khóa sổ đối với tài khoản công nhân' })
  completeShift(@Param('id') shiftId: string) {
    return this.productionService.completeShift(shiftId);
  }
}
