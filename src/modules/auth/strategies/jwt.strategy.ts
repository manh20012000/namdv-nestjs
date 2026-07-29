import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EntityManager } from 'typeorm';
import { User } from '../../../entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly entityManager: EntityManager) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'factory-planning-secret-key-12345',
    });
  }

  async validate(payload: { sub: string; username: string }) {
    const user = await this.entityManager.findOne(User, {
      where: { id: payload.sub },
      select: ['id', 'username', 'fullName', 'role', 'departmentId'],
    });

    if (!user) {
      throw new UnauthorizedException('Token không hợp lệ hoặc tài khoản không tồn tại.');
    }

    return user;
  }
}
