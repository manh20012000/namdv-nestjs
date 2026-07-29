import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Department } from './department.entity';
import { ProductionShift } from './production-shift.entity';

@Entity('machines')
export class Machine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column()
  departmentId: string;

  @ManyToOne(() => Department, (dept) => dept.machines)
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @OneToMany(() => ProductionShift, (shift) => shift.machine)
  shifts: ProductionShift[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
