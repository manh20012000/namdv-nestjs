import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, Unique, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Department } from './department.entity';
import { Machine } from './machine.entity';
import { User } from './user.entity';
import { ShiftWorker } from './shift-worker.entity';
import { ProductionRecord } from './production-record.entity';
import { ShiftName, ShiftStatus } from './enums';

@Entity('production_shifts')
@Unique(['date', 'shift', 'machineId'])
export class ProductionShift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'enum', enum: ShiftName })
  shift: ShiftName;

  @Column()
  departmentId: string;

  @ManyToOne(() => Department, (dept) => dept.shifts)
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column()
  machineId: string;

  @ManyToOne(() => Machine, (machine) => machine.shifts)
  @JoinColumn({ name: 'machineId' })
  machine: Machine;

  @Column()
  leadUserId: string;

  @ManyToOne(() => User, (user) => user.shiftsLed)
  @JoinColumn({ name: 'leadUserId' })
  leadUser: User;

  @Column({ type: 'enum', enum: ShiftStatus, default: ShiftStatus.DRAFT })
  status: ShiftStatus;

  @OneToMany(() => ShiftWorker, (sw) => sw.shift, { cascade: true })
  workers: ShiftWorker[];

  @OneToMany(() => ProductionRecord, (record) => record.shift)
  records: ProductionRecord[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
