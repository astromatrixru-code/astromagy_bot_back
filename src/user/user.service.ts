import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import {
  UserDto,
  CreateUserDto,
  UpdateUserDto,
  AuthResponseDto,
} from './dto/user.dto';
import { User, UserGender } from '../generated/prisma';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private isProfileComplete(user: User): boolean {
    return !!(user.birthDate && user.latitude && user.longitude);
  }

  private serialize(user: User): UserDto {
    return {
      telegramId: user.telegramId.toString(),
      email: user.email ?? undefined,
      username: user.username ?? undefined,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
      gender: user.gender as UserGender,
      address: user.address ?? undefined,
      latitude: user.latitude ?? undefined,
      longitude: user.longitude ?? undefined,
      birthDate: user.birthDate?.toISOString() ?? undefined,
    };
  }

  async upsertUser(dto: CreateUserDto): Promise<AuthResponseDto> {
    const tId = BigInt(dto.telegramId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { telegramId, ...updateData } = dto;

    const user = await this.prisma.user.upsert({
      where: { telegramId: tId },
      update: updateData,
      create: {
        ...updateData,
        telegramId: tId,
      },
    });

    const sub: string = user.telegramId.toString();
    const token: string = this.jwtService.sign({ sub });

    return {
      user: this.serialize(user),
      authToken: token,
      isProfileComplete: this.isProfileComplete(user),
    };
  }

  async findOne(telegramId: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });

    if (!user) throw new NotFoundException('User not found');
    return this.serialize(user);
  }

  async update(telegramId: string, dto: UpdateUserDto): Promise<UserDto> {
    try {
      const user = await this.prisma.user.update({
        where: { telegramId: BigInt(telegramId) },
        data: dto,
      });
      return this.serialize(user);
    } catch {
      throw new NotFoundException('User not found');
    }
  }

  async remove(telegramId: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { telegramId: BigInt(telegramId) },
      });
    } catch {
      throw new NotFoundException('User not found');
    }
  }
}
