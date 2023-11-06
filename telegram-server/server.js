const {Telegraf, session, Scenes} = require('telegraf');
const createWizard = require('./createWizard');
const partiesScene = require('./partiesScene')

// Stage manager
const stage = new Scenes.Stage();
stage.register(createWizard);
stage.register(partiesScene);

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());

bot.use(stage.middleware());
bot.command("create", (ctx) => ctx.scene.enter(createWizard.id));
bot.command("parties", (ctx) => ctx.scene.enter(partiesScene.id));


bot.launch()
console.log('Bot is running...');
