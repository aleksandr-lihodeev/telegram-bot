require("dotenv").config();
const { Telegraf } = require("telegraf");

if (!process.env.BOT_TOKEN) {
  throw new Error("BOT_TOKEN is not defined in the .env file");
}

const bot = new Telegraf(process.env.BOT_TOKEN);

// Регулярное выражение для фильтрации ругательств и нецензурных выражений
const swearRegex =
  /(?<![а-яё])(?:(?:(?:у|[нз]а|(?:хитро|не)?вз?[ыьъ]|с[ьъ]|(?:и|ра)[зс]ъ?|(?:о[тб]|п[оа]д)[ьъ]?|(?:\S(?=[а-яё]))+?[оаеи-])-?)?(?:[её](?:б(?!о[рй]|рач)|п[уа](?:ц|тс))|и[пб][ае][тцд][ьъ]).*?|(?:(?:н[иеа]|ра[зс]|[зд]?[ао](?:т|дн[оа])?|с(?:м[еи])?|а[пб]ч)-?)?ху(?:[яйиеёю]|л+и(?!ган)).*?|бл(?:[эя]|еа?)(?:[дт][ьъ]?)?|\S*?(?:п(?:[иеё]зд|ид[аое]?р|ед(?:р(?!о)|[аое]р|ик)|охую)|бля(?:[дбц]|тс)|[ое]ху[яйиеё]|хуйн).*?|(?:о[тб]?|про|на|вы)?м(?:анд(?:[ауеыи](?:л(?:и[сзщ])?[ауеиы])?|ой|[ао]в.*?|юк(?:ов|[ауи])?|е[нт]ь|ища)|уд(?:[яаиое].+?|е?н(?:[ьюия]|ей))|[ао]л[ао]ф[ьъ](?:[яиюе]|[еёо]й))|елд[ауые].*?|ля[тд]ь|(?:[нз]а|по)х)(?![а-яё])/giu;

// Функция замены ругательств и нецензурных выражений на звездочки
const censorMessage = (text) => {
  return text.replace(swearRegex, (match) => "*".repeat(match.length));
};

// Проверка прав администратора
const checkAdminRights = async (ctx) => {
  try {
    const member = await ctx.telegram.getChatMember(
      ctx.chat.id,
      ctx.botInfo.id
    );
    return member.status === "administrator" || member.status === "creator";
  } catch (err) {
    console.error("Error checking admin rights:", err);
    return false;
  }
};

// Обработчик сообщений
bot.on("text", async (ctx) => {
  const originalMessage = ctx.message.text;
  const censoredMessage = censorMessage(originalMessage);

  if (originalMessage !== censoredMessage) {
    try {
      const hasAdminRights = await checkAdminRights(ctx);
      if (!hasAdminRights) {
        await ctx.reply(
          "У меня нет прав на удаление сообщений, пожалуйста, назначьте меня администратором с соответствующими правами."
        );
        return;
      }

      await ctx.deleteMessage(ctx.message.message_id);

      const username =
        ctx.message.from.username ||
        `${ctx.message.from.first_name} ${ctx.message.from.last_name || ""}`;

      await ctx.replyWithMarkdown(`*${username}:*\n${censoredMessage}`);
    } catch (err) {
      console.error(err);
      await ctx.reply(
        "Произошла ошибка при попытке удалить сообщение. Пожалуйста, попробуйте позже."
      );
    }
  }
});

bot
  .launch()
  .then(() => console.log("Bot started"))
  .catch((err) => console.error("Failed to start bot", err));
