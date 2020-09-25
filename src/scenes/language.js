const Scene = require('telegraf/scenes/base');
const {Telegraf} = require('telegraf');
const {Extra} = Telegraf;

module.exports = () => {
    const languageScene = new Scene('language');

    languageScene.enter(async (ctx) => {
        // if (ctx.session.mesage_filter.length !== 0) {
        //     ctx.session.mesage_filter.forEach(msg => {
        //         ctx.deleteMessage(msg)
        //     })
        // }

        const msg = ctx.reply(`${ctx.i18n.t('langChoose')}`, Extra.markup(markup => {
            return markup.keyboard([
                [`🇷🇺 Русский язык`],
                [`🇺🇿 O'zbek tili`]
            ]).resize();
        }))
        ctx.session.mesage_filter.push((await msg).message_id);
    });

    languageScene.on('text', async ctx => {
        console.log('fff');
        if (ctx.message.text === `🇷🇺 Русский язык` || ctx.message.text === `🇺🇿 O'zbek tili`) {

            if (ctx.message.text === `🇷🇺 Русский язык`) {
                ctx.session.chosenLanguage = 'ru'
                ctx.i18n.locale(`ru`)

            } else if (ctx.message.text === `🇺🇿 O'zbek tili`) {
                ctx.session.chosenLanguage = 'uz'
                ctx.i18n.locale(`uz`)
            }

            if (ctx.session.languageChosen) {
                ctx.session.languageChosen = false;
                return ctx.scene.enter('mainMenu', {
                    start: `${ctx.i18n.t('mainMenu')}`
                })
            } else {
                return ctx.scene.enter('mainMenu');
            }
        }

    });

    return languageScene
}
