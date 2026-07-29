import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Machine } from './machine.entity';
import { ProductionShift } from './production-shift.entity';
import { TransferHandover } from './transfer-handover.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => User, (user) => user.department)
  users: User[];

  @OneToMany(() => Machine, (machine) => machine.department)
  machines: Machine[];

  @OneToMany(() => ProductionShift, (shift) => shift.department)
  shifts: ProductionShift[];

  @OneToMany(() => TransferHandover, (handover) => handover.targetDepartment)
  handovers: TransferHandover[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
