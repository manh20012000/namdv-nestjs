import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.auditLogs)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  action: string; // CREATE, UPDATE, DELETE, LOGIN, APPROVE

  @Column()
  entityName: string;

  @Column()
  entityId: string;

  @Column({ type: 'text', nullable: true })
  beforeValue: string; // JSON string

  @Column({ type: 'text', nullable: true })
  afterValue: string; // JSON string

  @CreateDateColumn()
  createdAt: Date;
}
