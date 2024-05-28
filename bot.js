require("dotenv").config();
const { Telegraf } = require("telegraf");

if (!process.env.BOT_TOKEN) {
  throw new Error("BOT_TOKEN is not defined in the .env file");
}

const bot = new Telegraf(process.env.BOT_TOKEN);

// Список запрещенных слов
const badWords = ["сука", "пиздец", "ебал"];

// Функция замены матов на звездочки
const censorMessage = (text) => {
  return badWords.reduce((censoredText, word) => {
    const regex = new RegExp(word, "gi");
    return censoredText.replace(regex, "*".repeat(word.length));
  }, text);
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
