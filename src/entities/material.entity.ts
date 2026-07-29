import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BOM } from './bom.entity';
import { MaterialUsage } from './material-usage.entity';

@Entity('materials')
export class Material {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ unique: true })
  name: string;

  @Column()
  unit: string;

  @OneToMany(() => BOM, (bom) => bom.material)
  boms: BOM[];

  @OneToMany(() => MaterialUsage, (usage) => usage.material)
  usages: MaterialUsage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
