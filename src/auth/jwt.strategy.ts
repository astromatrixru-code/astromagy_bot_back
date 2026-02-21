import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'HGtdvlXCuKIbHptv3FeRlvM5w7OL',
    });
  }

  validate(payload: { sub: string; username?: string }) {
    return { telegramId: payload.sub, username: payload.username };
  }
}
