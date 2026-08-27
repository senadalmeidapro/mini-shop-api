import { SetMetadata } from '@nestjs/common';

export const rolesKey = 'roles';
export type RoleLike = 'user' | 'admin';
export const roles = (...roles: RoleLike[]) => SetMetadata(rolesKey, roles);
