import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { User } from './entities/user.entity';
import { Machine } from './entities/machine.entity';
import { Product } from './entities/product.entity';
import { Material } from './entities/material.entity';
import { BOM } from './entities/bom.entity';
import { WorkOrder } from './entities/work-order.entity';
import { ProductionShift } from './entities/production-shift.entity';
import { ShiftWorker } from './entities/shift-worker.entity';
import { ProductionRecord } from './entities/production-record.entity';
import { MaterialUsage } from './entities/material-usage.entity';
import { TransferHandover } from './entities/transfer-handover.entity';
import { AuditLog } from './entities/audit-log.entity';

import { AuthModule } from './modules/auth/auth.module';
import { ProductionModule } from './modules/production/production.module';
import { ManagerModule } from './modules/manager/manager.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'factory_db',
      entities: [
        Department,
        User,
        Machine,
        Product,
        Material,
        BOM,
        WorkOrder,
        ProductionShift,
        ShiftWorker,
        ProductionRecord,
        MaterialUsage,
        TransferHandover,
        AuditLog,
      ],
      synchronize: true, // synchronize schemas automatically for development base
    }),
    AuthModule,
    ProductionModule,
    ManagerModule,
  ],
})
export class AppModule {}
