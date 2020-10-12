const Scene = require('telegraf/scenes/base');
const {Telegraf} = require('telegraf');
const {Extra} = Telegraf;


module.exports = (bot, I18n) => {
    const cartScene = new Scene('cart');

    cartScene.enter(async ctx => {



        if (ctx.session.catalogueCart.length === 0) {
            return ctx.scene.enter('mainMenu', {
                start: `${ctx.i18n.t('cartEmpty')}`
            })
        } else if (typeof ctx.session.catalogueCart === 'undefined') {
            ctx.session.catalogueCart = [];
        }

        // ctx.session.mesage_filter.forEach(msg => {
        //     ctx.deleteMessage(msg)
        // })
        ctx.session.cartProps = {};

        let totalPrice = 0;

        let addingText = `
${ctx.i18n.t('cartText')}:
        `;

        ctx.session.cartProps.orderText = '';

        console.log(ctx.session.catalogueCart);

        ctx.session.catalogueCart.forEach((order, index) => {

            if (typeof (order.clotheQuantity) === 'object') {
                if (Object.keys(order.clotheQuantity).length > 0) {
                    let qty = order.clotheQuantity;
                    let sizes = order.clotheSize;
                    qty = '';
                    sizes = '';
                    let price = 0;
                    for (const [key, value] of Object.entries(order.clotheQuantity)) {
                        sizes += `${key} `;
                        qty += `\n\t\t${key}: ${value}`;
                        price = price + (order.clotheShotPrice * value);
                    }
                    ctx.session.cartProps.orderText += `
${index}) <b>${ctx.i18n.t('cartCategory')}</b>: ${order.clotheName}
     <b>${ctx.i18n.t('cartStyle')}</b>: ${order.clotheVariation}
     <b>${ctx.i18n.t('cartSize')}</b>: ${sizes}
     <b>${ctx.i18n.t('cartQty')}</b>: ${qty}
     <b>${ctx.i18n.t('cartPrice')}</b>: ${price}
     `;
                    totalPrice += price;
                } else {
                    ctx.session.catalogueCart.splice(index, 1);
                    return ctx.scene.enter('cart');
                }
            } else {
                console.log('not objects');
                ctx.session.cartProps.orderText += `
${index}) <b>${ctx.i18n.t('cartCategory')}</b>: ${order.clotheName}
     <b>${ctx.i18n.t('cartStyle')}</b>: ${order.clotheVariation}
     <b>${ctx.i18n.t('cartSize')}</b>: ${order.clotheSize}
     <b>${ctx.i18n.t('cartQty')}</b>: ${order.clotheQuantity}
     <b>${ctx.i18n.t('cartPrice')}</b>: ${order.clothePrice}
     `;
                totalPrice += order.clothePrice;
            }
        })

        ctx.session.cartProps.orderText += `\n<b>${ctx.i18n.t('cartTotalPrice')}</b>: <i>${totalPrice}</i>`;
        addingText += ctx.session.cartProps.orderText;


        ctx.session.cartProps.multiplePrintMarkup = ctx.session.catalogueCart.map((order, index) => {

            if (typeof (order.clotheQuantity) === 'object') {
                // console.log('ojbect');
                let sss = [];
                for (const [key, value] of Object.entries(order.clotheQuantity)) {
                    sss.push(
                        [{
                            text: `${order.clotheName} "${order.clotheVariation}" ${ctx.i18n.t('cartSize')}: ${key} (${value} ${ctx.i18n.t('cartShot')})`,
                            callback_data: `s:${order}`
                        }],
                        [{text: '➖', callback_data: `sub:${index}:${key}`},
                            {text: '❌', callback_data: `d:${index}:${key}`},
                            {text: '➕', callback_data: `add:${index}:${key}`}
                        ])
                }
                return sss;
            } else {
                // for (const [key, value] of Object.entries(ctx.session.currentProps.clotheQuantity)) {
                //     msg += `\n\t\t${key}: ${value}`;
                // }

                return [
                    [{
                        text: `${order.clotheName} "${order.clotheVariation}" (${order.clotheQuantity} ${ctx.i18n.t('cartShot')}) `,
                        callback_data: `s:${order}`
                    }],
                    [{text: '➖', callback_data: `sub:${index}`},
                        {text: '❌', callback_data: `d:${index}`},
                        {text: '➕', callback_data: `add:${index}`}
                    ]]
            }
        });


        const msg = ctx.reply(`${ctx.i18n.t('cartOrderConfirm')}`, Extra.markup(markup => {
            return markup.keyboard([[`${ctx.i18n.t('menuConfirmOrder')}`, `${ctx.i18n.t('menuCleanCart')}`], [`${ctx.i18n.t('menuMainBack')}`]]).resize();
        }))

        ctx.session.cartProps.orderMarkup = ctx.replyWithHTML(addingText, Extra.markup(markup => {
            return markup.inlineKeyboard([...ctx.session.cartProps.multiplePrintMarkup.flat()]).resize();
        }))


    })

    cartScene.hears(I18n.match('menuMainBack'), async ctx => {
        // ctx.deleteMessage((await ctx.session.cartProps.orderMarkup).message_id);
        ctx.scene.enter('mainMenu', {
            start: `${ctx.i18n.t('mainMenu')}`
        })
    })
    cartScene.hears(I18n.match('menuConfirmOrder'), async ctx => {
        // ctx.deleteMessage((await ctx.session.cartProps.orderMarkup).message_id);
        ctx.scene.enter('Order')
    })

    cartScene.hears(I18n.match('menuCleanCart'), async ctx => {
        // ctx.deleteMessage((await ctx.session.cartProps.orderMarkup).message_id);
        ctx.session.catalogueCart.splice(0, ctx.session.catalogueCart.length);

        ctx.scene.enter('mainMenu', {
            start: `${ctx.i18n.t('cartClean')}`
        })
    })

    cartScene.on('callback_query', async ctx => {
        ctx.deleteMessage((await ctx.session.cartProps.orderMarkup).message_id);
        ctx.answerCbQuery();

        const [methodType, clothe, size] = ctx.callbackQuery.data.split(':');

        if (methodType === 'd') {
            const itemNumber = ctx.session.catalogueCart.findIndex((order, index) => {
                return index === Number(clothe);
            })

            if (size) {

                delete ctx.session.catalogueCart[itemNumber].clotheQuantity[`${size}`];

                return ctx.scene.enter('cart');
            }

            ctx.session.catalogueCart.splice(itemNumber, 1);

            return ctx.scene.enter('cart');
        } else if (methodType === 'add') {
            const itemNumber = ctx.session.catalogueCart.findIndex((order, index) => {
                return index === Number(clothe);
            })

            if (size) {
                ctx.session.catalogueCart[itemNumber].clotheQuantity[`${size}`] += 1;
                return ctx.scene.enter('cart');
            }

            ctx.session.catalogueCart[itemNumber].clotheQuantity += 1;
            return ctx.scene.enter('cart');
        } else if (methodType === 'sub') {
            const itemNumber = ctx.session.catalogueCart.findIndex((order, index) => {
                return index === Number(clothe);
            })

            if (size) {
                ctx.session.catalogueCart[itemNumber].clotheQuantity[`${size}`] -= 1;
                if (ctx.session.catalogueCart[itemNumber].clotheQuantity[`${size}`] === 0) {
                    delete ctx.session.catalogueCart[itemNumber].clotheQuantity[`${size}`];

                    return ctx.scene.enter('cart');
                }
                return ctx.scene.enter('cart');
            }

            ctx.session.catalogueCart[itemNumber].clotheQuantity -= 1;
            if (ctx.session.catalogueCart[itemNumber].clotheQuantity === 0) {
                delete ctx.session.catalogueCart[itemNumber];

                return ctx.scene.enter('cart');
            }

            return ctx.scene.enter('cart');
        }

        return ctx.scene.enter('cart');
    })

    return cartScene;
}