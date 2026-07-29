import { Controller, Get, Post, Body, Query, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '../../entities/enums';
import { ManagerService } from './manager.service';
import { FilterQueryDto } from './dto/filter-query.dto';
import { CloneShiftDto } from './dto/clone-shift.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor';
import { ShiftStatus } from '../../entities/enums';

@ApiTags('Màn hình Quản lý (Manager)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('manager')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  @Get('dashboard')
  @Roles(Role.TRUONG_PHONG, Role.GIAM_DOC)
  @ApiOperation({ summary: 'Lấy các chỉ số KPI Dashboard nhanh' })
  getDashboard(@Query() filter: FilterQueryDto) {
    return this.managerService.getDashboardStats(filter);
  }

  @Get('reports/by-department')
  @Roles(Role.TRUONG_PHONG, Role.GIAM_DOC)
  @ApiOperation({ summary: 'Lấy báo cáo tổng hợp theo Khâu (cho phép khoan sâu máy, lệnh, vật tư)' })
  getDepartmentReport(@Query() filter: FilterQueryDto) {
    return this.managerService.getDepartmentReport(filter);
  }

  @Post('shift/:id/approve')
  @Roles(Role.TRUONG_PHONG, Role.GIAM_DOC)
  @UseInterceptors(AuditLogInterceptor)
  @ApiOperation({ summary: 'Phê duyệt ca sản xuất' })
  approveShift(@Param('id') shiftId: string) {
    return this.managerService.updateShiftStatus(shiftId, ShiftStatus.APPROVED);
  }

  @Post('shift/:id/lock')
  @Roles(Role.TRUONG_PHONG, Role.GIAM_DOC)
  @UseInterceptors(AuditLogInterceptor)
  @ApiOperation({ summary: 'Khóa sổ ca sản xuất' })
  lockShift(@Param('id') shiftId: string) {
    return this.managerService.updateShiftStatus(shiftId, ShiftStatus.LOCKED);
  }

  @Post('shift/:id/clone')
  @Roles(Role.TRUONG_PHONG, Role.GIAM_DOC)
  @UseInterceptors(AuditLogInterceptor)
  @ApiOperation({ summary: 'Sao chép thông tin ca sản xuất sang ngày/ca khác' })
  cloneShift(@Param('id') shiftId: string, @Body() dto: CloneShiftDto) {
    return this.managerService.cloneShift(shiftId, dto);
  }
}
