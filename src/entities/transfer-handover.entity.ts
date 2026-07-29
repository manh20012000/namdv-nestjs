import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ProductionRecord } from './production-record.entity';
import { Department } from './department.entity';

@Entity('transfer_handovers')
export class TransferHandover {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productionRecordId: string;

  @ManyToOne(() => ProductionRecord, (record) => record.handovers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productionRecordId' })
  productionRecord: ProductionRecord;

  @Column()
  targetDepartmentId: string;

  @ManyToOne(() => Department, (dept) => dept.handovers)
  @JoinColumn({ name: 'targetDepartmentId' })
  targetDepartment: Department;

  @Column({ type: 'float' })
  quantity: number;

  @Column()
  recipientName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
