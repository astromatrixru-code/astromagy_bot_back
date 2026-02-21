import { AppService } from './app.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectBot, On, Start, Update } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { actionButtons } from './helpers/buttons';
import { UsersService } from './user/user.service';

@Update()
@Injectable()
export class AppUpdate {
  constructor(
    @InjectBot()
    private readonly bot: Telegraf<Context>,
    private readonly appService: AppService,
    private readonly usersService: UsersService,
  ) {}

  @Start()
  async startCommand(ctx: Context) {
    const tgUser = ctx.from;
    if (!tgUser) return;

    try {
      const authData = await this.usersService.upsertUser({
        telegramId: tgUser.id.toString(),
        username: tgUser.username,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
      });

      const authToken = authData.authToken;

      Logger.log(
        `User ${tgUser.id} authorized. Complete: ${authData.isProfileComplete}`,
      );

      await ctx.replyWithPhoto(
        {
          url:
            process.env.WELCOME_BANNER_URL ||
            'https://natalchartruler.com/wp-content/uploads/2025/03/group-159.png',
        },
        {
          caption:
            `✨ <b>АстроМагия: Твой Путеводитель по Звёздам</b>\n\n` +
            `Твоя натальная карта — это персональный чертёж твоей судьбы. Узнай, что приготовили для тебя планеты! 🌌\n\n` +
            `🔹 <b>Разбор личности</b>\n` +
            `🔹 <b>Карма и предназначение</b>\n` +
            `🔹 <b>Любовь и отношения</b>\n\n` +
            `<i>Нажми на кнопку ниже, чтобы открыть свою карту!</i> 👇`,
          parse_mode: 'HTML',
          ...actionButtons(authToken),
        },
      );
    } catch (error) {
      Logger.error('Error during start command', error);
      await ctx.reply(
        'Произошла ошибка при запуске приложения. Попробуйте позже.',
      );
    }
  }

  @On('message')
  async onMessage(ctx: Context) {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const sentMessage = await ctx.reply('Вы не можете писать этому боту! ✨');
    await ctx.deleteMessage().catch(() => null);

    setTimeout(() => {
      void ctx.telegram
        .deleteMessage(chatId, sentMessage.message_id)
        .catch(() => null);
    }, 3000);
  }

  @On('sticker')
  async onSticker(ctx: Context) {
    await ctx.deleteMessage().catch(() => null);
  }
}
