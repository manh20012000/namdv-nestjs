import { SetMetadata } from '@nestjs/common';
import { Role } from '../../entities/enums';

export interface VisibilityRule {
  role: Role;
  exclude: string[];
}

export const FIELDS_VISIBILITY_KEY = 'fields_visibility';
export const FieldsVisibility = (...rules: VisibilityRule[]) => SetMetadata(FIELDS_VISIBILITY_KEY, rules);
