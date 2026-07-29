import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BOM } from './bom.entity';
import { ProductionRecord } from './production-record.entity';
import { WorkOrder } from './work-order.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => BOM, (bom) => bom.product)
  boms: BOM[];

  @OneToMany(() => ProductionRecord, (record) => record.product)
  records: ProductionRecord[];

  @OneToMany(() => WorkOrder, (order) => order.product)
  orders: WorkOrder[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
