import { SetMetadata } from '@nestjs/common';

export const rolesKey = 'roles';
export type RoleLike = 'user' | 'admin' | 'supplier';
export const roles = (...roles: RoleLike[]) => SetMetadata(rolesKey, roles);
