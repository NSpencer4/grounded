import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { AuthUser } from '../strategies/jwt.strategy'

@Injectable()
export class OrgAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const user = request.user as AuthUser
    const orgId = request.params.orgId

    if (!orgId) {
      return true
    }

    if (user.role === 'ADMIN') {
      return true
    }

    if (user.organizationId && user.organizationId !== orgId) {
      throw new ForbiddenException(
        'Access denied. User does not have permission to access this organization.',
      )
    }

    return true
  }
}
