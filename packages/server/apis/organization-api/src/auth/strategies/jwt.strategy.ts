import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'
import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt'

export interface JwtPayload {
  sub: string
  email?: string
  name?: string
  organizationId?: string
  role?: 'CUSTOMER' | 'REPRESENTATIVE' | 'ADMIN'
  iat?: number
  exp?: number
  iss?: string
  aud?: string
}

export interface AuthUser {
  userId: string
  organizationId?: string
  email?: string
  name?: string
  role?: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET')
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required')
    }

    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      issuer: configService.get<string>('JWT_ISSUER', 'grounded-api'),
      audience: configService.get<string>('JWT_AUDIENCE', 'grounded-services'),
      algorithms: ['HS256', 'HS384', 'HS512'],
    }

    super(options)
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    if (!payload.sub) {
      throw new UnauthorizedException('Token missing required "sub" claim')
    }

    return {
      userId: payload.sub,
      organizationId: payload.organizationId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    }
  }
}
