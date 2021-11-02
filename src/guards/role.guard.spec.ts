import { Reflector } from '@nestjs/core';
import { RoleGuard } from './role.guard';

describe('RoleGuard', () => {
  it('should be defined', () => {
    expect(new RoleGuard(new Reflector())).toBeDefined();
  });
});
