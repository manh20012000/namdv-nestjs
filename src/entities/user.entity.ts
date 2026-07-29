import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Department } from './department.entity';
import { ProductionShift } from './production-shift.entity';
import { ShiftWorker } from './shift-worker.entity';
import { AuditLog } from './audit-log.entity';
import { Role } from './enums';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  fullName: string;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @Column({ nullable: true })
  departmentId: string;

  @ManyToOne(() => Department, (dept) => dept.users, { nullable: true })
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @OneToMany(() => ProductionShift, (shift) => shift.leadUser)
  shiftsLed: ProductionShift[];

  @OneToMany(() => ShiftWorker, (sw) => sw.user)
  shiftWorkers: ShiftWorker[];

  @OneToMany(() => AuditLog, (log) => log.user)
  auditLogs: AuditLog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
