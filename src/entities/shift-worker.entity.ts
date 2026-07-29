import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ProductionShift } from './production-shift.entity';
import { User } from './user.entity';

@Entity('shift_workers')
@Unique(['shiftId', 'userId'])
export class ShiftWorker {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  shiftId: string;

  @ManyToOne(() => ProductionShift, (shift) => shift.workers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shiftId' })
  shift: ProductionShift;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.shiftWorkers)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'float', default: 100.0 })
  sharePercentage: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
