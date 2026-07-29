import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin', description: 'Tên đăng nhập' })
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'password123', description: 'Mật khẩu' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString()
  password: string;
}
