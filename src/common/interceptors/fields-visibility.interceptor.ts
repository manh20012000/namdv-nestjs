import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FIELDS_VISIBILITY_KEY, VisibilityRule } from '../decorators/fields-visibility.decorator';

@Injectable()
export class FieldsVisibilityInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const rules = this.reflector.getAllAndOverride<VisibilityRule[]>(FIELDS_VISIBILITY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!rules) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      return next.handle();
    }

    const rule = rules.find((r) => r.role === user.role);
    if (!rule) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        return this.filterFields(data, rule.exclude);
      }),
    );
  }

  private filterFields(data: any, excludeFields: string[]): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.filterFields(item, excludeFields));
    }

    if (typeof data === 'object') {
      const filtered: any = {};
      for (const key of Object.keys(data)) {
        if (excludeFields.includes(key)) {
          continue;
        }
        filtered[key] = this.filterFields(data[key], excludeFields);
      }
      return filtered;
    }

    return data;
  }
}
