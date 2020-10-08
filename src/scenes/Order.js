const Scene = require('telegraf/scenes/base');
const {Telegraf} = require('telegraf');
const {Extra} = Telegraf;
const Question = require('./../models/Questions');

module.exports.orderEnterScene = (bot, I18n) => {
    const OrderScene = new Scene('Order');

    OrderScene.enter(async (ctx) => {
        ctx.session.orderProps = {};
        ctx.scene.enter('catalogueContactName')
    });

    return OrderScene
}



module.exports.orderContactNameScene = (bot, I18n) => {
    const catalogueContactNameScene = new Scene('catalogueContactName');

    catalogueContactNameScene.enter(async (ctx) => {
        const rMarkup = `${ctx.i18n.t('menuBack')}`;

        const msg = ctx.reply(`${ctx.i18n.t('catalogClotheContactName')}`, Extra.markup(markup => {
            return markup.keyboard([[`${ctx.i18n.t('menuMainBack')}`]]).resize();
        }))

        ctx.session.mesage_filter.push((await msg).message_id);
    })

    catalogueContactNameScene.hears(I18n.match('menuBack'), ctx => {
        ctx.scene.enter('mainMenu', {
            start: ctx.i18n.t('mainMenu')
        })
    })

    catalogueContactNameScene.hears(I18n.match('menuMainBack'), ctx => {
        ctx.scene.enter('mainMenu', {
            start: ctx.i18n.t('mainMenu')
        })
    })

    catalogueContactNameScene.on('text', async (ctx) => {
        ctx.session.orderProps.clotheContactName = ctx.message.text;
        ctx.scene.enter('catalogueContactPhone');
    })

    return catalogueContactNameScene;
}

module.exports.orderContactPhoneScene = (bot, I18n) => {
    const catalogueContactPhoneScene = new Scene('catalogueContactPhone');

    catalogueContactPhoneScene.enter(async (ctx) => {
        const rMarkup = [`${ctx.i18n.t('menuBack')}`];

        const msg = ctx.reply(`${ctx.i18n.t('catalogClotheContactPhone')}`, Extra.markup(markup => {
            return markup.keyboard([rMarkup, [`${ctx.i18n.t('menuMainBack')}`]]).resize();
        }))

        ctx.session.mesage_filter.push((await msg).message_id);
    })

    catalogueContactPhoneScene.hears(I18n.match('menuBack'), (ctx) => {
        ctx.scene.enter('catalogueContactName');
    })

    catalogueContactPhoneScene.hears(I18n.match('menuMainBack'), ctx => {
        ctx.scene.enter('mainMenu', {
            start: `${ctx.i18n.t('mainMenu')}`
        })
    })

    catalogueContactPhoneScene.on('text', async (ctx) => {
        ctx.session.orderProps.catalogueContactPhone = ctx.message.text;
        ctx.scene.enter('catalogueLocation')
    })

    return catalogueContactPhoneScene;
}

module.exports.orderContactLocationScene = (bot, I18n) => {
    const catalogueContactLocationScene = new Scene('catalogueLocation');

    catalogueContactLocationScene.enter(async (ctx) => {
        ctx.session.orderProps.catalogueContactAdress = '';
        const rMarkup = [`${ctx.i18n.t('menuBack')}`];

        const msg = ctx.reply(`${ctx.i18n.t('catalogClotheAskLocaction')}`, Extra.markup(markup => {
            return markup.keyboard([[markup.locationRequestButton(`${ctx.i18n.t('catalogClotheSendLocation')}`)], rMarkup, [`${ctx.i18n.t('menuMainBack')}`]]).resize();
        }))

        ctx.session.mesage_filter.push((await msg).message_id);
    })

    catalogueContactLocationScene.hears(I18n.match('menuBack'), (ctx) => {
        ctx.scene.enter('catalogueContactPhone');
    })

    catalogueContactLocationScene.hears(I18n.match('menuMainBack'), ctx => {
        ctx.scene.enter('mainMenu', {
            start: `${ctx.i18n.t('mainMenu')}`
        })
    })

    catalogueContactLocationScene.on('location', async (ctx) => {
        ctx.session.orderProps.catalogueContactAdressLatLon = ctx.message.location;
        ctx.scene.enter('catalogueEndScene')
    })

    catalogueContactLocationScene.on('text', async (ctx) => {
        ctx.session.orderProps.catalogueContactAdress = ctx.message.text;
        ctx.scene.enter('catalogueEndScene')
    })

    return catalogueContactLocationScene;
}

module.exports.orderEndScene = (bot, I18n) => {


    const catalogueEndScene = new Scene('catalogueEndScene');

    catalogueEndScene.enter(async (ctx) => {


        const rMarkup = [`${ctx.i18n.t('menuBack')}`];

        let writtenAdress;

        if (ctx.session.orderProps.catalogueContactAdress) {
            writtenAdress = `<b>${ctx.i18n.t('catalogClothConfirmClotheAdress')}:</b> ${ctx.session.orderProps.catalogueContactAdress}`;
        }

        ctx.session.orderProps.endMarkup = `
<b>${ctx.i18n.t('catalogClothConfirmClotheContact')}:</b> ${ctx.session.orderProps.clotheContactName}
<b>${ctx.i18n.t('catalogClothConfirmClotheNumber')}:</b> ${ctx.session.orderProps.catalogueContactPhone}
${writtenAdress ? writtenAdress : '\n'}
${ctx.session.cartProps.orderText}`;

        const msg = ctx.replyWithHTML(ctx.session.orderProps.endMarkup);


        const msg_2 = ctx.reply(`${ctx.i18n.t('catalogClotheConfirm')}`, Extra.markup(markup => {
            return markup.keyboard([[`${ctx.i18n.t('catalogClotheConfirmed')}`], rMarkup, [`${ctx.i18n.t('menuMainBack')}`]]).resize();
        }))

        ctx.session.mesage_filter.push((await msg_1).message_id);
        ctx.session.mesage_filter.push((await msg_2).message_id);


    })

    catalogueEndScene.hears(I18n.match('menuBack'), (ctx) => {
        ctx.scene.enter('catalogueLocation');
    })

    catalogueEndScene.hears(I18n.match('menuMainBack'), ctx => {
        ctx.scene.enter('mainMenu', {
            start: `${ctx.i18n.t('mainMenu')}`
        })
    })

    catalogueEndScene.on('text', async (ctx) => {
        if (ctx.message.text === `${ctx.i18n.t('catalogClotheConfirmed')}`) {


            await bot.telegram.sendMessage('-1001323833574', `${ctx.session.orderProps.endMarkup}`,
                {parse_mode: "HTML"})
            if (ctx.session.orderProps.catalogueContactAdressLatLon) {
                await bot.telegram.sendLocation('-1001323833574',
                    ctx.session.orderProps.catalogueContactAdressLatLon.latitude,
                    ctx.session.orderProps.catalogueContactAdressLatLon.longitude);
            }

            ctx.session.catalogueCart.splice(0, ctx.session.catalogueCart.length);

            ctx.scene.enter('mainMenu', {
                start: `${ctx.i18n.t('requestCompleteMsg')}`
            })
        }
    })

    return catalogueEndScene;
}
