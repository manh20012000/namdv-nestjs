import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EntityManager, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { ProductionShift } from '../../entities/production-shift.entity';
import { ShiftWorker } from '../../entities/shift-worker.entity';
import { Department } from '../../entities/department.entity';
import { ShiftStatus } from '../../entities/enums';
import { FilterQueryDto } from './dto/filter-query.dto';
import { CloneShiftDto } from './dto/clone-shift.dto';

@Injectable()
export class ManagerService {
  constructor(private readonly entityManager: EntityManager) {}

  private buildWhereClause(filter: FilterQueryDto) {
    const where: any = {};

    if (filter.startDate && filter.endDate) {
      const start = new Date(filter.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(filter.endDate);
      end.setHours(23, 59, 59, 999);
      where.date = Between(start, end);
    } else if (filter.startDate) {
      const start = new Date(filter.startDate);
      start.setHours(0, 0, 0, 0);
      where.date = MoreThanOrEqual(start);
    } else if (filter.endDate) {
      const end = new Date(filter.endDate);
      end.setHours(23, 59, 59, 999);
      where.date = LessThanOrEqual(end);
    }

    if (filter.departmentId) {
      where.departmentId = filter.departmentId;
    }

    if (filter.shift) {
      where.shift = filter.shift;
    }

    if (filter.leadUserId) {
      where.leadUserId = filter.leadUserId;
    }

    if (filter.machineId) {
      where.machineId = filter.machineId;
    }

    if (filter.status) {
      where.status = filter.status;
    }

    return where;
  }

  async getDashboardStats(filter: FilterQueryDto) {
    const where = this.buildWhereClause(filter);

    const shifts = await this.entityManager.find(ProductionShift, {
      where,
      relations: ['records'],
    });

    let totalProduced = 0;
    let totalScrap = 0;
    let completedShifts = 0;
    let totalShifts = shifts.length;
    let wasteSum = 0;
    let recordCount = 0;

    for (const shift of shifts) {
      if (
        shift.status === ShiftStatus.COMPLETED ||
        shift.status === ShiftStatus.APPROVED ||
        shift.status === ShiftStatus.LOCKED
      ) {
        completedShifts++;
      }
      if (shift.records) {
        for (const record of shift.records) {
          totalProduced += record.quantityProduced;
          totalScrap += record.scrapQuantity + record.scrapOtherQuantity;
          wasteSum += record.wastePercentage;
          recordCount++;
        }
      }
    }

    const averageWaste = recordCount > 0 ? Number((wasteSum / recordCount).toFixed(2)) : 0;

    return {
      totalProduced,
      totalScrap,
      completedShifts,
      totalShifts,
      averageWaste,
    };
  }

  async getDepartmentReport(filter: FilterQueryDto) {
    const where = this.buildWhereClause(filter);

    const shifts = await this.entityManager.find(ProductionShift, {
      where,
      relations: [
        'department',
        'machine',
        'records',
        'records.product',
        'records.workOrder',
        'records.materialUsages',
        'records.materialUsages.material',
      ],
    });

    const reportMap: Record<string, any> = {};

    for (const shift of shifts) {
      const deptName = shift.department.name;
      if (!reportMap[deptName]) {
        reportMap[deptName] = {
          departmentId: shift.departmentId,
          departmentName: deptName,
          totalProduced: 0,
          totalScrapQuantity: 0,
          totalScrapOtherQuantity: 0,
          averageWaste: 0,
          shiftCount: 0,
          wasteSum: 0,
          recordCount: 0,
          machines: {},
          orders: {},
          materials: {},
        };
      }

      const deptData = reportMap[deptName];
      deptData.shiftCount++;

      if (shift.records) {
        for (const record of shift.records) {
          deptData.totalProduced += record.quantityProduced;
          deptData.totalScrapQuantity += record.scrapQuantity;
          deptData.totalScrapOtherQuantity += record.scrapOtherQuantity;
          deptData.wasteSum += record.wastePercentage;
          deptData.recordCount++;

          // Drilldown by Machine
          const machineCode = shift.machine.code;
          if (!deptData.machines[machineCode]) {
            deptData.machines[machineCode] = {
              code: machineCode,
              name: shift.machine.name,
              totalProduced: 0,
              totalScrap: 0,
            };
          }
          deptData.machines[machineCode].totalProduced += record.quantityProduced;
          deptData.machines[machineCode].totalScrap += record.scrapQuantity + record.scrapOtherQuantity;

          // Drilldown by WorkOrder
          const orderCode = record.workOrder.code;
          if (!deptData.orders[orderCode]) {
            deptData.orders[orderCode] = {
              code: orderCode,
              productCode: record.product.code,
              productName: record.product.name,
              totalProduced: 0,
              totalScrap: 0,
            };
          }
          deptData.orders[orderCode].totalProduced += record.quantityProduced;
          deptData.orders[orderCode].totalScrap += record.scrapQuantity + record.scrapOtherQuantity;

          // Drilldown by Material usage
          if (record.materialUsages) {
            for (const usage of record.materialUsages) {
              const matCode = usage.material.code;
              if (!deptData.materials[matCode]) {
                deptData.materials[matCode] = {
                  code: matCode,
                  name: usage.material.name,
                  unit: usage.material.unit,
                  consumed: 0,
                };
              }
              deptData.materials[matCode].consumed += usage.consumed;
            }
          }
        }
      }
    }

    return Object.values(reportMap).map((dept: any) => {
      const averageWaste = dept.recordCount > 0 ? Number((dept.wasteSum / dept.recordCount).toFixed(2)) : 0;
      return {
        departmentId: dept.departmentId,
        departmentName: dept.departmentName,
        totalProduced: dept.totalProduced,
        totalScrapQuantity: dept.totalScrapQuantity,
        totalScrapOtherQuantity: dept.totalScrapOtherQuantity,
        averageWaste,
        shiftCount: dept.shiftCount,
        machines: Object.values(dept.machines),
        orders: Object.values(dept.orders),
        materials: Object.values(dept.materials),
      };
    });
  }

  async updateShiftStatus(shiftId: string, status: ShiftStatus) {
    const shift = await this.entityManager.findOne(ProductionShift, {
      where: { id: shiftId },
    });

    if (!shift) {
      throw new NotFoundException('Không tìm thấy ca sản xuất.');
    }

    shift.status = status;
    return this.entityManager.save(ProductionShift, shift);
  }

  async cloneShift(shiftId: string, dto: CloneShiftDto) {
    const originalShift = await this.entityManager.findOne(ProductionShift, {
      where: { id: shiftId },
      relations: ['workers'],
    });

    if (!originalShift) {
      throw new NotFoundException('Không tìm thấy ca sản xuất gốc.');
    }

    const targetDate = new Date(dto.targetDate);
    targetDate.setHours(0, 0, 0, 0);

    const existing = await this.entityManager.findOne(ProductionShift, {
      where: {
        date: targetDate,
        shift: dto.targetShift,
        machineId: originalShift.machineId,
      },
    });

    if (existing) {
      throw new BadRequestException('Ca sản xuất tại ngày và máy này đã tồn tại, không thể sao chép đè.');
    }

    const cloned = await this.entityManager.transaction(async (manager) => {
      const newShift = manager.create(ProductionShift, {
        date: targetDate,
        shift: dto.targetShift,
        departmentId: originalShift.departmentId,
        machineId: originalShift.machineId,
        leadUserId: originalShift.leadUserId,
        status: ShiftStatus.DRAFT,
      });
      const savedShift = await manager.save(ProductionShift, newShift);

      if (originalShift.workers && originalShift.workers.length > 0) {
        const clonedWorkers = originalShift.workers.map((w) =>
          manager.create(ShiftWorker, {
            shiftId: savedShift.id,
            userId: w.userId,
            sharePercentage: w.sharePercentage,
          }),
        );
        await manager.save(ShiftWorker, clonedWorkers);
      }

      return manager.findOne(ProductionShift, {
        where: { id: savedShift.id },
        relations: ['workers'],
      });
    });

    return cloned;
  }
}
