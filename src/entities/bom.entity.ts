import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Product } from './product.entity';
import { Material } from './material.entity';

@Entity('boms')
@Unique(['productId', 'materialId'])
export class BOM {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @ManyToOne(() => Product, (product) => product.boms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  materialId: string;

  @ManyToOne(() => Material, (material) => material.boms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'materialId' })
  material: Material;

  @Column({ type: 'float' })
  standardQuantity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
