import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Product } from './product.entity';
import { ProductionRecord } from './production-record.entity';
import { WorkOrderStatus } from './enums';

@Entity('work_orders')
export class WorkOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  productId: string;

  @ManyToOne(() => Product, (product) => product.orders)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'enum', enum: WorkOrderStatus, default: WorkOrderStatus.PENDING })
  status: WorkOrderStatus;

  @OneToMany(() => ProductionRecord, (record) => record.workOrder)
  records: ProductionRecord[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
