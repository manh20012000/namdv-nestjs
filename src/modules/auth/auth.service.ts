import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { EntityManager } from 'typeorm';
import { User } from '../../entities/user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.entityManager.findOne(User, {
      where: { username: dto.username },
    });

    if (!user) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác.');
    }

    const isPasswordValid = await compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác.');
    }

    const payload = { sub: user.id, username: user.username, role: user.role };
    
    return {
      success: true,
      message: 'Đăng nhập thành công.',
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        departmentId: user.departmentId,
      },
    };
  }
}
