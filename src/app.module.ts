import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import LocalSession from 'telegraf-session-local';
import { AppUpdate } from './app.updater';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
import { UsersService } from './user/user.service';
import { UsersController } from './user/user.controller';
import { JwtStrategy } from './auth/jwt.strategy';

const sessions = new LocalSession({ database: 'session_db.json' });
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        middlewares: [sessions.middleware()],
        token: configService.get<string>('BOT_TOKEN')!,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController, UsersController],
  providers: [AppService, AppUpdate, PrismaService, UsersService, JwtStrategy],
  exports: [PrismaService],
})
export class AppModule {}
