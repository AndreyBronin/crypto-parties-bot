const {Scenes} = require('telegraf');

//https://github.com/telegraf/telegraf/issues/705
// https://stackoverflow.com/questions/64091380/telegraf-js-leave-wizardscene-with-a-button

const createWizard = new Scenes.WizardScene('create-wizard',
    async ctx => {
        ctx.wizard.state.data = {};
        ctx.telegram.sendMessage(ctx.from.id, "Insert name", {
            parse_mode: 'MarkdownV2',
            // reply_markup: cancelOrder()
        })
        return ctx.wizard.next();
    },
    ctx => {

        ctx.wizard.state.data.name = ctx.update.callback_query.data;
        ctx.reply("here is your name: "+ctx.wizard.state.data.name);
        return ctx.scene.leave();
    }
);

// Сцена создания нового матча.
const create = new Scenes.WizardScene(
    "create", // Имя сцены
    (ctx) => {
        ctx.reply('Этап 1: выбор типа матча.');
        return ctx.wizard.next(); // Переходим к следующему обработчику.
    },
    (ctx) => {
        ctx.reply('Этап 2: выбор времени проведения матча.');
        return ctx.wizard.next(); // Переходим к следующему обработчику.
    },
    (ctx) => {
        if (ctx.message.text === "Назад") {
            ctx.wizard.back(); // Вернуться к предыдущиму обработчику
        }
        ctx.reply('Этап 3: выбор места проведения матча.');
        return ctx.wizard.next(); // Переходим к следующему обработчику.
    },

    // ...

    (ctx) => {
        ctx.reply('Финальный этап: создание матча.');
        return ctx.scene.leave();
    }
);

module.exports = createWizard
