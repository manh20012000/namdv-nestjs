import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ProductionRecord } from './production-record.entity';
import { Material } from './material.entity';

@Entity('material_usages')
export class MaterialUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productionRecordId: string;

  @ManyToOne(() => ProductionRecord, (record) => record.materialUsages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productionRecordId' })
  productionRecord: ProductionRecord;

  @Column()
  materialId: string;

  @ManyToOne(() => Material, (material) => material.usages)
  @JoinColumn({ name: 'materialId' })
  material: Material;

  @Column({ type: 'float' })
  initialStock: number; // tồn đầu

  @Column({ type: 'float' })
  newlyReceived: number; // nhập mới

  @Column({ type: 'float' })
  consumed: number; // tiêu hao

  @Column({ type: 'float' })
  finalStock: number; // tồn cuối

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
