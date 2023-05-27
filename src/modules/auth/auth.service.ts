import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(data: AuthDto) {
    // gerar a hash da senha
    const hash = await argon.hash(data.password);

    // salvar o usuario na database
    try {
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          hash,
        },
      });

      // retornar o usuario salvo
      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error.code == 'P2002') {
        // esse codigo de erro acontece quando alguem tenta criar um novo registro de usuario com um campo unico que ja esta no banco
        throw new ForbiddenException('Credentials taken');
      }

      throw error;
    }
  }

  async signin(data: AuthDto) {
    // achar o user por email
    const user = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    // se o user nao existir lanca uma excecao
    if (!user) throw new ForbiddenException('Credentials incorrect');

    // comparar o hash da senha
    const passwordMatch = await argon.verify(user.hash, data.password);

    // se a senha for incorreta lanca uma excecao
    if (!passwordMatch) throw new ForbiddenException('Credentials incorrect');

    // retorna o usuario num token jwt
    return this.signToken(user.id, user.email);
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });

    return {
      access_token: token,
    };
  }
}
