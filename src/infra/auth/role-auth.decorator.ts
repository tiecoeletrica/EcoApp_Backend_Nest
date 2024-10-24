// src/infra/auth/use-case.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UseCases } from 'src/core/role-authorization/use-cases.enum';

export const RoleAuth = (useCase: UseCases) => SetMetadata('useCase', useCase);