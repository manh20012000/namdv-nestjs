import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ProductionShift } from './production-shift.entity';
import { WorkOrder } from './work-order.entity';
import { Product } from './product.entity';
import { MaterialUsage } from './material-usage.entity';
import { TransferHandover } from './transfer-handover.entity';

@Entity('production_records')
export class ProductionRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  shiftId: string;

  @ManyToOne(() => ProductionShift, (shift) => shift.records, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shiftId' })
  shift: ProductionShift;

  @Column()
  workOrderId: string;

  @ManyToOne(() => WorkOrder, (wo) => wo.records)
  @JoinColumn({ name: 'workOrderId' })
  workOrder: WorkOrder;

  @Column()
  productId: string;

  @ManyToOne(() => Product, (product) => product.records)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'float' })
  quantityProduced: number; // đạt

  @Column({ type: 'float' })
  scrapQuantity: number; // hỏng do sản xuất (via, cục...)

  @Column({ type: 'float' })
  scrapOtherQuantity: number; // hỏng do lỗi khâu trước

  @Column({ type: 'float' })
  wastePercentage: number; // % hao phí

  @Column({ nullable: true })
  wasteReason: string;

  @Column()
  productionTime: number; // phút

  @Column({ nullable: true })
  notes: string;

  @OneToMany(() => MaterialUsage, (usage) => usage.productionRecord, { cascade: true })
  materialUsages: MaterialUsage[];

  @OneToMany(() => TransferHandover, (handover) => handover.productionRecord, { cascade: true })
  handovers: TransferHandover[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
