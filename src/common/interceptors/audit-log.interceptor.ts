import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { EntityManager } from 'typeorm';
import { AuditLog } from '../../entities/audit-log.entity';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly entityManager: EntityManager) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;

    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    if (!isMutation || !user) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (response) => {
        try {
          let entityName = 'Unknown';
          let entityId = 'Unknown';

          if (url.includes('/production/shift')) {
            entityName = 'ProductionShift';
            entityId = response?.id || 'Unknown';
          } else if (url.includes('/manager/shift')) {
            entityName = 'ProductionShift';
            entityId = url.split('/').pop() || 'Unknown';
          }

          let action = 'CREATE';
          if (method === 'PUT' || method === 'PATCH') {
            action = 'UPDATE';
          } else if (method === 'DELETE') {
            action = 'DELETE';
          }

          if (url.includes('/approve')) {
            action = 'APPROVE';
          }

          // Create audit log using TypeORM
          const log = this.entityManager.create(AuditLog, {
            userId: user.id,
            action,
            entityName,
            entityId,
            afterValue: response ? JSON.stringify(response) : null,
          });
          await this.entityManager.save(AuditLog, log);
        } catch (error) {
          console.error('Failed to log audit:', error);
        }
      }),
    );
  }
}
