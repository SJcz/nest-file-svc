import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import _ = require('lodash');

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles || !roles.length) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return matchRoles(user, roles);
  }
}

function matchRoles(user, roles) {
  if (!user || !user.roles || !user.roles.length) return false;
  return !!_.intersection(user.roles, roles).length;
}
