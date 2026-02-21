import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './user.service';
import {
  UserDto,
  CreateUserDto,
  UpdateUserDto,
  AuthResponseDto,
} from './dto/user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    telegramId: string;
    username?: string;
  };
}

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('auth')
  @ApiOperation({ summary: 'Login/Register via Telegram' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async auth(@Body() dto: CreateUserDto): Promise<AuthResponseDto> {
    return this.usersService.upsertUser(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get current authorized user profile' })
  @ApiResponse({ status: 200, type: UserDto })
  async getMe(@Request() req: AuthenticatedRequest): Promise<UserDto> {
    Logger.log(`Fetching profile for user ${req.user.telegramId}`);
    return this.usersService.findOne(req.user.telegramId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('me')
  @ApiOperation({ summary: 'Update current authorized user profile' })
  @ApiResponse({ status: 200, type: UserDto })
  async updateMe(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.usersService.update(req.user.telegramId, dto);
  }

  @Get(':telegramId')
  @ApiOperation({ summary: 'Get user data by Telegram ID (Admin)' })
  @ApiParam({ name: 'telegramId', description: 'User ID in Telegram' })
  @ApiResponse({ status: 200, type: UserDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('telegramId') telegramId: string): Promise<UserDto> {
    return this.usersService.findOne(telegramId);
  }

  @Delete(':telegramId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a user from the system' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  async remove(@Param('telegramId') telegramId: string): Promise<void> {
    return this.usersService.remove(telegramId);
  }
}
