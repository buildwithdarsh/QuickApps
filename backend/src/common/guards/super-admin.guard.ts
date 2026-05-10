import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

const SUPER_ADMIN_EMAILS = (process.env.SUPER_ADMIN_EMAILS || '').split(',').map((e) => e.trim());

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();

    if (!user || !SUPER_ADMIN_EMAILS.includes(user.email)) {
      throw new ForbiddenException('Super admin access required');
    }

    return true;
  }
}
