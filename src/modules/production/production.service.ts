import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ProductionShift } from '../../entities/production-shift.entity';
import { ShiftWorker } from '../../entities/shift-worker.entity';
import { ProductionRecord } from '../../entities/production-record.entity';
import { MaterialUsage } from '../../entities/material-usage.entity';
import { TransferHandover } from '../../entities/transfer-handover.entity';
import { WorkOrder } from '../../entities/work-order.entity';
import { ShiftName, ShiftStatus, WorkOrderStatus } from '../../entities/enums';
import { CreateShiftDto } from './dto/create-shift.dto';
import { CreateRecordDto } from './dto/create-record.dto';

@Injectable()
export class ProductionService {
  constructor(private readonly entityManager: EntityManager) {}

  async getInitialStock(machineId: string, materialId: string): Promise<number> {
    const lastUsage = await this.entityManager
      .createQueryBuilder(MaterialUsage, 'usage')
      .innerJoin('usage.productionRecord', 'record')
      .innerJoin('record.shift', 'shift')
      .where('usage.materialId = :materialId', { materialId })
      .andWhere('shift.machineId = :machineId', { machineId })
      .andWhere('shift.status IN (:...statuses)', { statuses: [ShiftStatus.COMPLETED, ShiftStatus.APPROVED, ShiftStatus.LOCKED] })
      .orderBy('usage.createdAt', 'DESC')
      .select('usage.finalStock', 'finalStock')
      .getRawOne();

    return lastUsage ? Number(lastUsage.finalStock) : 0;
  }

  async createOrGetShift(userId: string, dto: CreateShiftDto) {
    const startOfDay = new Date(dto.date);
    startOfDay.setHours(0, 0, 0, 0);

    let shift = await this.entityManager.findOne(ProductionShift, {
      where: {
        date: startOfDay,
        shift: dto.shift,
        machineId: dto.machineId,
      },
      relations: [
        'workers',
        'workers.user',
        'records',
        'records.product',
        'records.workOrder',
        'records.materialUsages',
        'records.materialUsages.material',
        'records.handovers',
        'records.handovers.targetDepartment',
      ],
    });

    if (!shift) {
      shift = await this.entityManager.transaction(async (manager) => {
        const newShift = manager.create(ProductionShift, {
          date: startOfDay,
          shift: dto.shift,
          departmentId: dto.departmentId,
          machineId: dto.machineId,
          leadUserId: userId,
          status: ShiftStatus.DRAFT,
        });
        const savedShift = await manager.save(ProductionShift, newShift);

        const workers = dto.workerIds.map((wId) =>
          manager.create(ShiftWorker, {
            shiftId: savedShift.id,
            userId: wId,
            sharePercentage: Number((100.0 / dto.workerIds.length).toFixed(2)),
          }),
        );
        await manager.save(ShiftWorker, workers);

        return manager.findOne(ProductionShift, {
          where: { id: savedShift.id },
          relations: [
            'workers',
            'workers.user',
            'records',
            'records.product',
            'records.workOrder',
            'records.materialUsages',
            'records.materialUsages.material',
            'records.handovers',
            'records.handovers.targetDepartment',
          ],
        });
      });
    }

    return shift;
  }

  async addRecord(shiftId: string, dto: CreateRecordDto) {
    const shift = await this.entityManager.findOne(ProductionShift, { where: { id: shiftId } });
    if (!shift) {
      throw new NotFoundException('Không tìm thấy ca sản xuất.');
    }

    if (shift.status === ShiftStatus.LOCKED || shift.status === ShiftStatus.APPROVED || shift.status === ShiftStatus.COMPLETED) {
      throw new BadRequestException('Ca sản xuất này đã hoàn thành hoặc đã khóa, không thể chỉnh sửa.');
    }

    // 1. Calculate waste percentage
    const totalOutput = dto.quantityProduced + dto.scrapQuantity + dto.scrapOtherQuantity;
    const totalScrap = dto.scrapQuantity + dto.scrapOtherQuantity;
    const wastePercentage = totalOutput > 0 ? (totalScrap / totalOutput) * 100 : 0;

    // 2. Validate waste > 5% and notes presence
    if (wastePercentage > 5.0 && (!dto.notes || dto.notes.trim() === '')) {
      throw new BadRequestException(
        `Cảnh báo: Tỷ lệ hao phí là ${wastePercentage.toFixed(2)}% (Vượt ngưỡng 5%). Bạn bắt buộc phải nhập lý do hao phí cụ thể vào trường Ghi chú.`,
      );
    }

    const workOrder = await this.entityManager.findOne(WorkOrder, { where: { id: dto.workOrderId } });
    if (!workOrder) {
      throw new NotFoundException('Không tìm thấy Lệnh sản xuất.');
    }

    const record = await this.entityManager.transaction(async (manager) => {
      const newRecord = manager.create(ProductionRecord, {
        shiftId,
        workOrderId: dto.workOrderId,
        productId: workOrder.productId,
        quantityProduced: dto.quantityProduced,
        scrapQuantity: dto.scrapQuantity,
        scrapOtherQuantity: dto.scrapOtherQuantity,
        wastePercentage: Number(wastePercentage.toFixed(2)),
        wasteReason: wastePercentage > 5.0 ? dto.notes : null,
        productionTime: dto.productionTime,
        notes: dto.notes,
      });
      const savedRecord = await manager.save(ProductionRecord, newRecord);

      const usages = dto.materials.map((m) => {
        const finalStock = m.initialStock + m.newlyReceived - m.consumed;
        return manager.create(MaterialUsage, {
          productionRecordId: savedRecord.id,
          materialId: m.materialId,
          initialStock: m.initialStock,
          newlyReceived: m.newlyReceived,
          consumed: m.consumed,
          finalStock: finalStock,
        });
      });
      await manager.save(MaterialUsage, usages);

      if (dto.handovers && dto.handovers.length > 0) {
        const handovers = dto.handovers.map((h) =>
          manager.create(TransferHandover, {
            productionRecordId: savedRecord.id,
            targetDepartmentId: h.targetDepartmentId,
            quantity: h.quantity,
            recipientName: h.recipientName,
          }),
        );
        await manager.save(TransferHandover, handovers);
      }

      if (workOrder.status === WorkOrderStatus.PENDING) {
        await manager.update(WorkOrder, dto.workOrderId, { status: WorkOrderStatus.RUNNING });
      }

      return manager.findOne(ProductionRecord, {
        where: { id: savedRecord.id },
        relations: [
          'product',
          'workOrder',
          'materialUsages',
          'materialUsages.material',
          'handovers',
          'handovers.targetDepartment',
        ],
      });
    });

    return record;
  }

  async completeShift(shiftId: string) {
    const shift = await this.entityManager.findOne(ProductionShift, {
      where: { id: shiftId },
      relations: ['records'],
    });

    if (!shift) {
      throw new NotFoundException('Không tìm thấy ca sản xuất.');
    }

    if (!shift.records || shift.records.length === 0) {
      throw new BadRequestException('Ca sản xuất chưa có lệnh sản xuất nào được nhập, không thể Hoàn thành.');
    }

    shift.status = ShiftStatus.COMPLETED;
    await this.entityManager.save(ProductionShift, shift);

    return this.entityManager.findOne(ProductionShift, {
      where: { id: shiftId },
      relations: [
        'workers',
        'workers.user',
        'records',
        'records.product',
        'records.workOrder',
        'records.materialUsages',
        'records.materialUsages.material',
        'records.handovers',
        'records.handovers.targetDepartment',
      ],
    });
  }
}
