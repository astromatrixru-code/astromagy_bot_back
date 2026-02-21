import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsEmail,
  IsNumber,
} from 'class-validator';
import { UserGender } from 'src/generated/prisma';

export class UserDto {
  @ApiProperty({ example: '550505050' })
  @IsString()
  telegramId!: string;

  @ApiPropertyOptional({ example: 'astromag' })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({ example: 'Ivan' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Ivanov' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: 'astromage@mail.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ enum: UserGender })
  @IsEnum(UserGender)
  @IsOptional()
  gender?: UserGender;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  birthDate?: string;
}

export class CreateUserDto extends UserDto { }

export class UpdateUserDto extends PartialType(
  OmitType(UserDto, ['telegramId'] as const),
) { }

export class AuthResponseDto {
  @ApiProperty()
  user!: UserDto;

  @ApiProperty()
  authToken!: string;

  @ApiProperty()
  isProfileComplete!: boolean;
}
