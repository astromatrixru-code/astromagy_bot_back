import { Logger } from '@nestjs/common';
import { Markup } from 'telegraf';

export function actionButtons(authToken: string) {
  const appUrl = process.env.APP_URL;
  Logger.log(`${appUrl}/?auth_token=${authToken}`);
  return Markup.inlineKeyboard([
    [
      Markup.button.webApp(
        '🔭 Открыть натальную карту',
        `${appUrl}/?auth_token=${authToken}`,
      ),
    ],
  ]);
}
