const Scene = require('telegraf/scenes/base');
const {Telegraf} = require('telegraf');
const {Extra} = Telegraf;
const Question = require('./../models/Questions');

module.exports = (bot, I18n) => {
    const askQuestionScene = new Scene('askQuestion');

    askQuestionScene.enter(async (ctx) => {

        ctx.session.askingQuestion = '';

        ctx.reply(`${ctx.i18n.t('askQuestionExpl')}`, Extra.markup(markup => {
            return markup.keyboard([
                [`${ctx.i18n.t('menuBack')}`]
            ]).resize();
        }))
    });

    askQuestionScene.hears(I18n.match('menuBack'), ctx => {
        ctx.scene.enter('mainMenu', {
            start: ctx.i18n.t('mainMenu')
        })
    })

    askQuestionScene.hears(I18n.match('askQuestionConfirm'), async ctx => {
        if (ctx.session.askingQuestion) {

            const sendMarkup = `<i>${ctx.from.username}</i>:\n${ctx.session.askingQuestion}`;



            const msg = await bot.telegram.sendMessage('-1001450276522',sendMarkup, {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [[{text: `${ctx.i18n.t('askQuestionCall')}`, callback_data: `${ctx.i18n.t('askQuestionCall')}`}]]
                }
            });

            Question.create({
                username: ctx.from.username,
                user_id: ctx.from.id,
                question: ctx.session.askingQuestion,
                message_id: msg.message_id,
                message_status: `${ctx.i18n.t('askQuestionCall')}`
            })


            return ctx.scene.enter('mainMenu', {
                start: ctx.i18n.t('askQuestionSent')
            })
        }

    });

    askQuestionScene.on('text', async ctx => {
        ctx.session.askingQuestion = ctx.message.text;
        ctx.replyWithHTML(`<b>${ctx.i18n.t('askQuestionMail')}</b>\n${ctx.message.text}`, Extra.markup(markup => {
            return markup.keyboard([
                [`${ctx.i18n.t('askQuestionConfirm')}`],
                [`${ctx.i18n.t('menuBack')}`],
            ]).resize();
        }));

    });


    return askQuestionScene
}
