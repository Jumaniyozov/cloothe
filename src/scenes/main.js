const Scene = require('telegraf/scenes/base');
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const HotQuestions = require('./../models/HotQuestions');


module.exports = (bot, I18n) => {
    const mainScene = new Scene('mainMenu');

    mainScene.enter(async (ctx) => {
        // ctx.session.mesage_filter.forEach(msg => {
        //     ctx.deleteMessage(msg)
        // })
        //
        let message = `${ctx.i18n.t('greeting')} ${ctx.from.username}`;

        const unauthMsg = [
            [`${ctx.i18n.t('menuCatalog')}`, `${ctx.i18n.t('menuPrint')}`],
            [`${ctx.i18n.t('menuQA')}`, `${ctx.i18n.t('menuAsk')}`],
            [`${ctx.i18n.t('menuAbout')}`],
            [ `${ctx.i18n.t('menuLanguage')}`],
        ]

        if (ctx.scene.state.start) {
            message = ctx.scene.state.start
        }


        const msg = bot.telegram.sendMessage(ctx.chat.id, message, {
            parse_mode: 'HTML',
            reply_markup: {
                keyboard: unauthMsg,
                resize_keyboard: true
            }
        })

        ctx.session.mesage_filter.push((await msg).message_id);
    })



    mainScene.hears(I18n.match('menuPrint'), ctx => {
        ctx.scene.enter('printing')
    })

   mainScene.hears(I18n.match('menuAsk'), ctx => {
        ctx.scene.enter('askQuestion')
    })

    mainScene.hears(I18n.match('menuCatalog'), ctx => {
        ctx.scene.enter('catalogue')
    })


    mainScene.hears(I18n.match('menuQA'), async ctx => {
        const qa = await HotQuestions.findAll();

        let counter = 1;

        let answers = `${ctx.i18n.t('mainFrequentQstn')}\n`;


        const qaObj = qa.map(question => {
            return {question: question.dataValues.question, answer: question.dataValues.answer}
        })

        qaObj.forEach(q => {
            answers += `    ${counter}. ❗ ${q.question}\n   ${q.answer}.\n\n`;
            counter++;
        })

        ctx.reply(answers);
    })

    mainScene.hears(I18n.match('menuAbout'), ctx => {
        ctx.scene.enter('about')
    })


    mainScene.hears(I18n.match('menuLanguage'), ctx => {
        ctx.session.languageChosen = true;
        ctx.scene.enter('language')
    })

    mainScene.hears(I18n.match('menuBack'), ctx => {
        ctx.scene.enter('mainMenu', {
            start: ctx.i18n.t('mainMenu')
        })
    })
    return mainScene;
}
