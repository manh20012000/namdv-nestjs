import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Hệ thống Quản lý Thống kê - Kế hoạch Sản xuất Nhà máy (TypeORM)')
    .setDescription(
      'Tài liệu hướng dẫn sử dụng API (Base NestJS + PostgreSQL + TypeORM) cho bản đặc tả 4 tab. ' +
      'Bao gồm nhập liệu công nhân theo ca, tính tồn cuối ca trước kế thừa, chặn lưu hao phí > 5%, phân chia sản lượng và báo cáo quản lý.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation is available at: http://localhost:${port}/api`);
}
bootstrap();
