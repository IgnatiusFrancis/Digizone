import { SetMetadata } from '@nestjs/common';
import { userTypes } from '../schema/users';

export const Roles = (...roles: userTypes[]) => {
  return SetMetadata('roles', roles);
};
