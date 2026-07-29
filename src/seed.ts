import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
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
import { Role, ShiftName, ShiftStatus, WorkOrderStatus } from './entities/enums';

// Pre-hashed password for "password123"
const HASHED_PASSWORD = '$2b$10$c7O34F8o/r7/JtG1/tPyeuFfUa7v6x4/L6w8Q4o3e5kQkH/yJ6u6y';

// Load .env file manually
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      process.env[key] = value.trim();
    }
  }
}

const dataSource = new DataSource({
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
  synchronize: true, // Auto create tables for quick setup
});

async function main() {
  console.log('Connecting to database...');
  await dataSource.initialize();
  console.log('Connected!');

  const queryRunner = dataSource.createQueryRunner();

  // 1. Create Departments
  console.log('Seeding departments...');
  const depts = ['In Offset', 'Bồi', 'Bế', 'Sóng', 'Xả'];
  const departmentMap: Record<string, Department> = {};
  for (const deptName of depts) {
    let dept = await dataSource.getRepository(Department).findOne({ where: { name: deptName } });
    if (!dept) {
      dept = dataSource.getRepository(Department).create({ name: deptName });
      await dataSource.getRepository(Department).save(dept);
    }
    departmentMap[deptName] = dept;
  }

  // 2. Create Users
  console.log('Seeding users...');
  const users = [
    { username: 'admin', password: HASHED_PASSWORD, fullName: 'Giám Đốc Nguyễn Văn A', role: Role.GIAM_DOC },
    { username: 'manager', password: HASHED_PASSWORD, fullName: 'Trưởng Phòng Trần Thị B', role: Role.TRUONG_PHONG, departmentId: departmentMap['Bồi'].id },
    { username: 'worker1', password: HASHED_PASSWORD, fullName: 'Công Nhân Lê Văn C', role: Role.CONG_NHAN, departmentId: departmentMap['Bồi'].id },
    { username: 'worker2', password: HASHED_PASSWORD, fullName: 'Công Nhân Phạm Văn D', role: Role.CONG_NHAN, departmentId: departmentMap['Bồi'].id },
    { username: 'worker3', password: HASHED_PASSWORD, fullName: 'Công Nhân Hoàng Thị E', role: Role.CONG_NHAN, departmentId: departmentMap['Bồi'].id },
  ];
  const userMap: Record<string, User> = {};
  for (const u of users) {
    let user = await dataSource.getRepository(User).findOne({ where: { username: u.username } });
    if (!user) {
      user = dataSource.getRepository(User).create(u);
    } else {
      user.role = u.role;
      user.departmentId = u.departmentId;
    }
    await dataSource.getRepository(User).save(user);
    userMap[u.username] = user;
  }

  // 3. Create Machines
  console.log('Seeding machines...');
  const machines = [
    { code: 'HH1', name: 'Máy Bồi HH1', departmentId: departmentMap['Bồi'].id },
    { code: 'HH2', name: 'Máy Bồi HH2', departmentId: departmentMap['Bồi'].id },
    { code: 'IO1', name: 'Máy In IO1', departmentId: departmentMap['In Offset'].id },
    { code: 'B1', name: 'Máy Bế B1', departmentId: departmentMap['Bế'].id },
    { code: 'S1', name: 'Máy Sóng S1', departmentId: departmentMap['Sóng'].id },
  ];
  const machineMap: Record<string, Machine> = {};
  for (const m of machines) {
    let machine = await dataSource.getRepository(Machine).findOne({ where: { code: m.code } });
    if (!machine) {
      machine = dataSource.getRepository(Machine).create(m);
      await dataSource.getRepository(Machine).save(machine);
    }
    machineMap[m.code] = machine;
  }

  // 4. Create Products
  console.log('Seeding products...');
  const products = [
    { code: 'FV/32', name: 'Hộp bia HN thường' },
    { code: 'FV/33', name: 'Hộp bia HN xanh' },
    { code: 'Funi500', name: 'Hộp Uniaqua 500' },
  ];
  const productMap: Record<string, Product> = {};
  for (const p of products) {
    let product = await dataSource.getRepository(Product).findOne({ where: { code: p.code } });
    if (!product) {
      product = dataSource.getRepository(Product).create(p);
      await dataSource.getRepository(Product).save(product);
    }
    productMap[p.code] = product;
  }

  // 5. Create Materials
  console.log('Seeding materials...');
  const materials = [
    { code: 'SONG_E', name: 'Sóng E', unit: 'Cuộn' },
    { code: 'KEO_BOI', name: 'Keo bồi', unit: 'Kg' },
    { code: 'TO_IN_HN', name: 'Tờ in hộp HN thường', unit: 'Tờ' },
  ];
  const materialMap: Record<string, Material> = {};
  for (const mat of materials) {
    let material = await dataSource.getRepository(Material).findOne({ where: { code: mat.code } });
    if (!material) {
      material = dataSource.getRepository(Material).create(mat);
      await dataSource.getRepository(Material).save(material);
    }
    materialMap[mat.code] = material;
  }

  // 6. Create BOM
  console.log('Seeding BOMs...');
  const boms = [
    { product: productMap['FV/32'], material: materialMap['SONG_E'], standardQuantity: 0.1 },
    { product: productMap['FV/32'], material: materialMap['KEO_BOI'], standardQuantity: 0.05 },
    { product: productMap['FV/33'], material: materialMap['SONG_E'], standardQuantity: 0.12 },
    { product: productMap['FV/33'], material: materialMap['KEO_BOI'], standardQuantity: 0.06 },
  ];
  for (const b of boms) {
    let bom = await dataSource.getRepository(BOM).findOne({
      where: { productId: b.product.id, materialId: b.material.id },
    });
    if (!bom) {
      bom = dataSource.getRepository(BOM).create({
        productId: b.product.id,
        materialId: b.material.id,
        standardQuantity: b.standardQuantity,
      });
      await dataSource.getRepository(BOM).save(bom);
    }
  }

  // 7. Create WorkOrders
  console.log('Seeding work orders...');
  const workOrders = [
    { code: 'LSX-001', productId: productMap['FV/32'].id, status: WorkOrderStatus.RUNNING },
    { code: 'LSX-002', productId: productMap['FV/33'].id, status: WorkOrderStatus.PENDING },
  ];
  const workOrderMap: Record<string, WorkOrder> = {};
  for (const wo of workOrders) {
    let workOrder = await dataSource.getRepository(WorkOrder).findOne({ where: { code: wo.code } });
    if (!workOrder) {
      workOrder = dataSource.getRepository(WorkOrder).create(wo);
      await dataSource.getRepository(WorkOrder).save(workOrder);
    }
    workOrderMap[wo.code] = workOrder;
  }

  // 8. Create historical shift for Machine HH1 to set Tồn Cuối
  console.log('Seeding historical shift...');
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  // YYYY-MM-DD
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let existingShift = await dataSource.getRepository(ProductionShift).findOne({
    where: {
      date: yesterdayStr as any,
      shift: ShiftName.C3,
      machineId: machineMap['HH1'].id,
    },
  });

  if (!existingShift) {
    // Create shift transactionally
    await dataSource.transaction(async (manager) => {
      const shift = manager.create(ProductionShift, {
        date: yesterdayStr as any,
        shift: ShiftName.C3,
        departmentId: departmentMap['Bồi'].id,
        machineId: machineMap['HH1'].id,
        leadUserId: userMap['worker1'].id,
        status: ShiftStatus.LOCKED,
      });
      const savedShift = await manager.save(shift);

      // Create workers
      await manager.save(ShiftWorker, [
        manager.create(ShiftWorker, { shiftId: savedShift.id, userId: userMap['worker1'].id, sharePercentage: 50.0 }),
        manager.create(ShiftWorker, { shiftId: savedShift.id, userId: userMap['worker2'].id, sharePercentage: 50.0 }),
      ]);

      // Create record
      const record = manager.create(ProductionRecord, {
        shiftId: savedShift.id,
        workOrderId: workOrderMap['LSX-001'].id,
        productId: productMap['FV/32'].id,
        quantityProduced: 1000,
        scrapQuantity: 20,
        scrapOtherQuantity: 5,
        wastePercentage: 2.44,
        productionTime: 480,
        notes: 'Ca làm việc hôm qua bình thường',
      });
      const savedRecord = await manager.save(record);

      // Create material usages
      await manager.save(MaterialUsage, [
        manager.create(MaterialUsage, {
          productionRecordId: savedRecord.id,
          materialId: materialMap['SONG_E'].id,
          initialStock: 200,
          newlyReceived: 0,
          consumed: 100,
          finalStock: 100, // final stock 100
        }),
        manager.create(MaterialUsage, {
          productionRecordId: savedRecord.id,
          materialId: materialMap['KEO_BOI'].id,
          initialStock: 80,
          newlyReceived: 0,
          consumed: 30,
          finalStock: 50, // final stock 50
        }),
      ]);
    });
    console.log('Historical shift seeded successfully!');
  }

  console.log('Database Seeding finished successfully!');
}

main()
  .catch((err) => {
    console.error('Error seeding database:', err);
    process.exit(1);
  })
  .finally(async () => {
    await dataSource.destroy();
  });
