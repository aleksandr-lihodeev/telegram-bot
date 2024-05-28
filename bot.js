require("dotenv").config();
const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

// Список запрещенных слов
const badWords = ["badword1", "badword2", "badword3"];

// Функция замены матов на звездочки
const censorMessage = (text) => {
  const regex = new RegExp(badWords.join("|"), "gi");
  return text.replace(regex, (match) => "*".repeat(match.length));
};

// Обработчик сообщений
bot.on("text", async (ctx) => {
  const originalMessage = ctx.message.text;
  const censoredMessage = censorMessage(originalMessage);

  if (originalMessage !== censoredMessage) {
    try {
      await ctx.deleteMessage(ctx.message.message_id);
      await ctx.replyWithMarkdown(
        `*Измененное сообщение от ${ctx.message.from.username}:*\n${censoredMessage}`
      );
    } catch (err) {
      console.error(err);
      ctx.reply(
        "У меня нет прав на удаление сообщений, пожалуйста, назначьте меня администратором с соответствующими правами."
      );
    }
  }
});

bot
  .launch()
  .then(() => console.log("Bot started"))
  .catch((err) => console.error("Failed to start bot", err));
