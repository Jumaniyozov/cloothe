const Scene = require('telegraf/scenes/base');
const {Telegraf} = require('telegraf');
const {Extra} = Telegraf;

const Catalogue = require('./../models/Catalogue');
const ClotheVariation = require('./../models/ClotheVariation');
const ClotheMaterial = require('./../models/ClotheMaterials');
const ClotheSize = require('./../models/ClotheSizes');

module.exports.catalogueEnterScene = (bot, I18n) => {
    const catalogueScene = new Scene('catalogue');

    catalogueScene.enter(async (ctx) => {
        // if (ctx.session.mesage_filter.length !== 0) {
        //     ctx.session.mesage_filter.forEach(msg => {
        //         ctx.deleteMessage(msg)
        //     })
        // }

        let message = `${ctx.i18n.t('catalogClotheType')}`;

        if (ctx.scene.state.start) {
            message = ctx.scene.state.start
        }


        const rMarkup = [`${ctx.i18n.t('menuMainBack')}`];
        const cMarkup = [];

        ctx.session.catalogue = await Catalogue.findAll();


        ctx.session.clotheTypes = ctx.session.catalogue.map(data => {
            if (ctx.session.chosenLanguage === 'ru') {
                cMarkup.unshift(data.dataValues.ruName)
                return data.dataValues.ruName;
            } else {
                cMarkup.unshift(data.dataValues.uzName)
                return data.dataValues.uzName;
            }
        })

        const msg = ctx.reply(message, Extra.markup(markup => {
            return markup.keyboard([cMarkup, [`${ctx.i18n.t('menuCatalogueCart')}`], rMarkup]).resize();
        }))
        ctx.session.mesage_filter.push((await msg).message_id);
    });

    catalogueScene.hears(I18n.match('menuBack'), ctx => {
        ctx.scene.enter('mainMenu', {
            start: `${ctx.i18n.t('mainMenu')}`
        })
    })
    catalogueScene.hears(I18n.match('menuMainBack'), ctx => {
        ctx.scene.enter('mainMenu', {
            start: `${ctx.i18n.t('mainMenu')}`
        })
    })
    catalogueScene.hears(I18n.match('menuCatalogueCart'), ctx => {
        ctx.scene.enter('cart')
    })


    catalogueScene.action('back', (ctx) => {
        ctx.answerCbQuery();
        ctx.scene.enter('mainMenu', {
            start: `${ctx.i18n.t('mainMenu')}`
        })
    })


    catalogueScene.on('text', async ctx => {

        // const currentSet = new Set();
        ctx.session.currentProps = {};
        ctx.session.currentProps.variationSet = new Set();

        if (ctx.session.clotheTypes.includes(ctx.message.text)) {
            const dd = ctx.session.catalogue.filter(data => {
                if (ctx.session.chosenLanguage === 'ru') {
                    return data.dataValues.ruName === ctx.message.text
                } else {
                    return data.dataValues.uzName === ctx.message.text
                }
            })
            ctx.session.currentProps.clotheType = dd[0].dataValues.ID


            const clothes = await ClotheVariation.findAll({where: {clothe: ctx.session.currentProps.clotheType}})

            const msg = ctx.replyWithPhoto(`${dd[0].dataValues.photoUrl}`)

            ctx.session.mesage_filter.push((await msg).message_id);

            if (ctx.session.chosenLanguage === 'ru') {
                ctx.session.currentProps.clotheName = dd[0].dataValues.ruName
                clothes.forEach(clothe => {
                    if (!ctx.session.currentProps.variationSet.has(clothe.dataValues.nameRu)) {
                        ctx.session.currentProps.variationSet.add(clothe.dataValues.nameRu)
                    }
                })
            } else {
                ctx.session.currentProps.clotheName = dd[0].dataValues.uzName
                clothes.forEach(clothe => {
                    if (!ctx.session.currentProps.variationSet.has(clothe.dataValues.nameUz)) {
                        ctx.session.currentProps.variationSet.add(clothe.dataValues.nameUz)
                    }
                })
            }

            ctx.session.currentProps.variationsArray = Array.from(ctx.session.currentProps.variationSet);

            return ctx.scene.enter('catalogueVariation');
        }
    });

    return catalogueScene
}

module.exports.catalogueVariationScene = (bot, I18n) => {
    const catalogueVariationScene = new Scene('catalogueVariation');

    catalogueVariationScene.enter(async (ctx) => {


        const rMarkup = `${ctx.i18n.t('menuBack')}`;

        const variationMarkup = ctx.session.currentProps.variationsArray.map(variation => {
            return [variation];
        })

        const msg = ctx.reply(`${ctx.i18n.t('catalogClotheStyle')}`, Extra.markup(markup => {
            return markup.keyboard([...variationMarkup, [rMarkup, `${ctx.i18n.t('menuMainBack')}`]]).resize();
        }))

        ctx.session.mesage_filter.push((await msg).message_id);
    });

    catalogueVariationScene.hears(I18n.match('menuBack'), (ctx) => {
        ctx.scene.enter('catalogue');
    })

    catalogueVariationScene.hears(I18n.match('menuMainBack'), ctx => {
        ctx.scene.enter('mainMenu', {
            start: `${ctx.i18n.t('mainMenu')}`
        })
    })


    catalogueVariationScene.on('text', async (ctx) => {
        if (ctx.session.currentProps.variationsArray.includes(ctx.message.text)) {
            ctx.session.currentProps.sizeSet = new Set();
            ctx.session.currentProps.clotheVariation = ctx.message.text;

            let currClothe;

            if (ctx.session.chosenLanguage === 'ru') {
                currClothe = await ClotheVariation.findAll({where: {nameRu: ctx.session.currentProps.clotheVariation}})
            } else {
                currClothe = await ClotheVariation.findAll({where: {nameUz: ctx.session.currentProps.clotheVariation}})
            }

            let clothes = await ClotheSize.findAll({
                where:
                    {
                        clothe: ctx.session.currentProps.clotheType
                    }
            })

            if (ctx.session.chosenLanguage === 'ru') {
                clothePhoto = await ClotheVariation.findAll({
                    where:
                        {
                            nameRu: ctx.session.currentProps.clotheVariation,
                        }
                })
                ctx.session.currentProps.clothePhoto = clothePhoto[0].dataValues.photoUrl;

                const msg = ctx.replyWithPhoto(`${clothePhoto[0].dataValues.photoUrl}`, {caption: `${clothePhoto[0].dataValues.captionRu}\n${clothePhoto[0].dataValues.price} Сум`})
            } else {
                clothePhoto = await ClotheVariation.findAll({
                    where:
                        {
                            nameUz: ctx.session.currentProps.clotheVariation,
                        }
                })
                ctx.session.currentProps.clothePhoto = clothePhoto[0].dataValues.photoUrl;

                const msg = ctx.replyWithPhoto(`${ctx.session.currentProps.clothePhoto}`, {caption: `${clothePhoto[0].dataValues.captionUz}\n${clothePhoto[0].dataValues.price} So'm`})

            }

            clothes.forEach(clothe => {
                if (!ctx.session.currentProps.sizeSet.has(clothe.dataValues.size)) {
                    ctx.session.currentProps.sizeSet.add(clothe.dataValues.size)
                }
            })

            ctx.session.currentProps.clothePrice = currClothe[0].dataValues.price;
            ctx.session.currentProps.sizeArray = Array.from(ctx.session.currentProps.sizeSet);

            return ctx.scene.enter('catalogueSize')
        }
    })

    return catalogueVariationScene;
}

// module.exports.catalogueMaterialScene = (bot, I18n) => {
//     const catalogueMaterialScene = new Scene('catalogueMaterial');
//
//     catalogueMaterialScene.enter(async (ctx) => {
//
//
//         const rMarkup = `${ctx.i18n.t('menuBack')}`;
//
//         const materialMarkup = ctx.session.currentProps.materialArray.map(variation => {
//             return [variation];
//         })
//
//         const msg = ctx.reply(`${ctx.i18n.t('catalogClotheMaterial')}`, Extra.markup(markup => {
//             return markup.keyboard([...materialMarkup, [rMarkup, `${ctx.i18n.t('menuMainBack')}`]]).resize();
//         }))
//
//         ctx.session.mesage_filter.push((await msg).message_id);
//     });
//
//     catalogueMaterialScene.hears(I18n.match('menuBack'), (ctx) => {
//         ctx.scene.enter('catalogueVariation');
//     })
//
//     catalogueMaterialScene.hears(I18n.match('menuMainBack'), ctx => {
//         ctx.scene.enter('mainMenu', {
//             start: `${ctx.i18n.t('mainMenu')}`
//         })
//     })
//
//     catalogueMaterialScene.on('text', async (ctx) => {
//             ctx.session.currentProps.sizeSet = new Set();
//
//             if (ctx.session.currentProps.materialArray.includes(ctx.message.text)) {
//                 ctx.session.currentProps.materialType = ctx.message.text;
//
//                 let clothes = await ClotheSize.findAll({
//                     where:
//                         {
//                             clothe: ctx.session.currentProps.clotheType
//                         }
//                 })
//
//                 if (ctx.session.chosenLanguage === 'ru') {
//                     clothePhoto = await ClotheMaterial.findAll({
//                         where:
//                             {
//                                 nameRu: ctx.session.currentProps.materialType,
//                             }
//                     })
//
//                     const msg = ctx.replyWithPhoto(`${clothePhoto[0].dataValues.photoUrl}`, {caption: clothePhoto[0].dataValues.captionRu})
//
//                 } else {
//                     clothePhoto = await ClotheMaterial.findAll({
//                         where:
//                             {
//                                 nameUz: ctx.session.currentProps.materialType,
//                             }
//                     })
//
//                     const msg = ctx.replyWithPhoto(`${clothePhoto[0].dataValues.photoUrl}`, {caption: clothePhoto[0].dataValues.captionUz})
//
//                 }
//
//                 clothes.forEach(clothe => {
//                     if (!ctx.session.currentProps.sizeSet.has(clothe.dataValues.size)) {
//                         ctx.session.currentProps.sizeSet.add(clothe.dataValues.size)
//                     }
//                 })
//             }
//
//
//             ctx.session.currentProps.sizeArray = Array.from(ctx.session.currentProps.sizeSet);
//
//             return ctx.scene.enter('catalogueSize');
//
//         }
//     )
//
//     return catalogueMaterialScene;
// }

module.exports.catalogueSizeScene = (bot, I18n) => {
    const catalogueSizeScene = new Scene('catalogueSize');

    catalogueSizeScene.enter(async (ctx) => {
        const rMarkup = `${ctx.i18n.t('menuBack')}`;

        ctx.session.currentProps.clotheSize = [];

        ctx.session.currentProps.sizeMarkup = ctx.session.currentProps.sizeArray.map(variation => {
            return [variation];
        })
        ctx.session.currentProps.sizeMarkupInitLength = ctx.session.currentProps.sizeMarkup.length;

        const msg = ctx.reply(`${ctx.i18n.t('catalogClotheSize')}`, Extra.markup(markup => {
            return markup.keyboard([...ctx.session.currentProps.sizeMarkup, [rMarkup, `${ctx.i18n.t('menuMainBack')}`]]).resize();
        }))

        ctx.session.mesage_filter.push((await msg).message_id);
    })

    catalogueSizeScene.hears(I18n.match('menuBack'), (ctx) => {
        ctx.scene.enter('catalogueVariation');
    })


    catalogueSizeScene.hears(I18n.match('menuMainBack'), ctx => {
        ctx.scene.enter('mainMenu', {
            start: `${ctx.i18n.t('mainMenu')}`
        })
    })

    catalogueSizeScene.on('text', async (ctx) => {
        const rMarkup = `${ctx.i18n.t('menuBack')}`;

        if (ctx.message.text === `${ctx.i18n.t('catalogClotheContinue')}` && ctx.session.currentProps.clotheSize.length > 0) {
            if (ctx.session.currentProps.clotheSize.length === 1) {

                return ctx.scene.enter('catalogueQuantity');
            } else {

                return ctx.scene.enter('catalogueMultipleQuantity');
            }
        }

        if (ctx.session.currentProps.sizeArray.includes(ctx.message.text) || ctx.session.currentProps.sizeArray.includes(ctx.message.text.split(' ')[0])) {
            if (ctx.session.currentProps.clotheSize.includes(ctx.message.text) || ctx.session.currentProps.clotheSize.includes(ctx.message.text.split(' ')[0])) {

                let pos = ctx.session.currentProps.clotheSize.indexOf(ctx.message.text.split(' ')[0])
                ctx.session.currentProps.clotheSize.splice(pos, 1);
                const addingCheck = ctx.session.currentProps.sizeMarkup.filter((clothe, index) => {
                    return clothe[0] === ctx.message.text
                });

                ctx.session.currentProps.sizeMarkup.map(clothe => {
                    if (clothe[0] === addingCheck[0][0]) {
                        const text = clothe[0].split(' ');
                        clothe[0] = text[0];
                    }
                })

                if (ctx.session.currentProps.clotheSize.length === 0) {
                    if (ctx.session.currentProps.sizeMarkup.length > ctx.session.currentProps.sizeMarkupInitLength) {
                        let pos = ctx.session.currentProps.sizeMarkup.indexOf([`${ctx.i18n.t('catalogClotheContinue')}`])
                        ctx.session.currentProps.sizeMarkup.splice(pos, 1);
                    }
                }

                ctx.reply(`${ctx.i18n.t('catalogClotheSize')}`, Extra.markup(markup => {
                    return markup.keyboard([...ctx.session.currentProps.sizeMarkup, [rMarkup, `${ctx.i18n.t('menuMainBack')}`]]).resize()
                }));

            } else {
                ctx.session.currentProps.clotheSize.push(ctx.message.text.split(' ')[0]);
                const addingCheck = ctx.session.currentProps.sizeMarkup.filter((clothe, index) => {
                    return clothe[0] === ctx.message.text
                })

                ctx.session.currentProps.sizeMarkup.map(clothe => {
                    if (clothe[0] === addingCheck[0][0]) {
                        clothe[0] = clothe[0] + ' ✅'
                    }
                })

                if (ctx.session.currentProps.clotheSize.length >= 1) {
                    if (ctx.session.currentProps.sizeMarkup.length === ctx.session.currentProps.sizeMarkupInitLength) {
                        ctx.session.currentProps.sizeMarkup.push([`${ctx.i18n.t('catalogClotheContinue')}`])
                    }
                }

                ctx.reply(`${ctx.i18n.t('catalogClotheSize')}`, Extra.markup(markup => {
                    return markup.keyboard([...ctx.session.currentProps.sizeMarkup, [rMarkup, `${ctx.i18n.t('menuMainBack')}`]]).resize()
                }));
            }

        }

    })

    return catalogueSizeScene;
}

module.exports.catalogueQuantityScene = (bot, I18n) => {
    const catalogueQuantityScene = new Scene('catalogueQuantity');

    catalogueQuantityScene.enter(async (ctx) => {
        const rMarkup = `${ctx.i18n.t('menuBack')}`;

        const msg = ctx.reply(`${ctx.i18n.t('catalogClotheQuantity')}`, Extra.markup(markup => {
            return markup.keyboard([['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], [rMarkup, `${ctx.i18n.t('menuMainBack')}`]]).resize();
        }))

        ctx.session.mesage_filter.push((await msg).message_id);
    })

    catalogueQuantityScene.hears(I18n.match('menuBack'), (ctx) => {
        ctx.scene.enter('catalogueSize');
    })

    catalogueQuantityScene.hears(I18n.match('menuMainBack'), ctx => {
        ctx.scene.enter('mainMenu', {
            start: `${ctx.i18n.t('mainMenu')}`
        })
    })

    catalogueQuantityScene.on('text', async (ctx) => {
        try {
            const integerified = Number.parseInt(ctx.message.text);
            if (integerified) {
                ctx.session.currentProps.clotheQuantity = integerified;
                ctx.session.currentProps.pendingPrice = ctx.session.currentProps.clotheQuantity * ctx.session.currentProps.clothePrice;

                ctx.scene.enter('catalogueAddToCartScene');
            }
        } catch (e) {
            console.log(e);
        }
    })

    return catalogueQuantityScene;
}


module.exports.catalogueSceneMultipleQuantity = () => {
    const catalogueSceneMultipleQuantity = new Scene('catalogueMultipleQuantity');

    catalogueSceneMultipleQuantity.enter(async (ctx) => {

        ctx.session.currentProps.multipleSizes = {};

        ctx.session.currentProps.multiplePrintMarkup = ctx.session.currentProps.clotheSize.map(size => {
            return [
                {text: '➖', callback_data: `s:m:${size}`},
                {text: `${size} 0`, callback_data: `s:s:${size}`},
                {text: '➕', callback_data: `s:p:${size}`}]
        });


        const msg_2 = ctx.reply(`${ctx.i18n.t('catalogClotheMultipleQuantity')}`, Extra.markup(markup => {
            return markup.removeKeyboard(true);
        }))

        ctx.deleteMessage((await msg_2).message_id);

        ctx.session.currentProps.multiQtymsg = ctx.reply(`${ctx.i18n.t('catalogClotheMultipleQuantity')}`, Extra.markup(markup => {
            return markup.inlineKeyboard([...ctx.session.currentProps.multiplePrintMarkup, [{
                text: `${ctx.i18n.t('menuBack')}`,
                callback_data: 'back'
            }], [{
                text: `${ctx.i18n.t('menuMainBack')}`,
                callback_data: 'mainback'
            }]]);
        }))

    });

    catalogueSceneMultipleQuantity.action('back', ctx => {
        ctx.scene.enter('catalogueSize')
    })

    catalogueSceneMultipleQuantity.action('mainback', ctx => {
        ctx.scene.enter('mainMenu', {
            start: `${ctx.i18n.t('mainMenu')}`
        })
    })


    catalogueSceneMultipleQuantity.action('continue', ctx => {

        ctx.session.currentProps.pendingPrice = 0;

        let sizes = [];

        if (Object.keys(ctx.session.currentProps.multipleSizes).length > 0) {
            const fff = Object.entries(ctx.session.currentProps.multipleSizes).forEach(entry => {
                const [key, value] = entry;
                ctx.session.currentProps.pendingPrice = ctx.session.currentProps.pendingPrice + (ctx.session.currentProps.clothePrice * value);
                sizes.push(key);
                return value === 0;
            });

            ctx.session.currentProps.clotheSize = sizes;
            ctx.session.currentProps.clotheQuantity = ctx.session.currentProps.multipleSizes;
            ctx.scene.enter('catalogueAddToCartScene')

        }

    })


    catalogueSceneMultipleQuantity.on('callback_query', async ctx => {


        const [type, methodType, size] = ctx.callbackQuery.data.split(':');
        ctx.answerCbQuery();
        if (methodType === 'm') {
            ctx.session.currentProps.multiplePrintMarkup.map(m => {
                const quantity = m[1].text.split(' ')[1];
                if (m[1].text.split(' ')[0] === size && quantity > 0) {
                    m[1].text = `${size} ${quantity - 1}`;
                    ctx.session.currentProps.multipleSizes[`${size}`] = quantity - 1;
                    if (ctx.session.currentProps.multipleSizes[`${size}`] === 0) {
                        delete ctx.session.currentProps.multipleSizes[`${size}`]
                    }
                }
                return m
            })

            ctx.deleteMessage((await ctx.session.currentProps.multiQtymsg).message_id);


            if (Object.keys(ctx.session.currentProps.multipleSizes).length > 0) {
                ctx.session.currentProps.multiQtymsg = ctx.reply(`${ctx.i18n.t('catalogClotheMultipleQuantity')}`, Extra.markup(markup => {
                    return markup.inlineKeyboard(
                        [...ctx.session.currentProps.multiplePrintMarkup,
                            [{text: `${ctx.i18n.t('catalogClotheContinue')}`, callback_data: 'continue'}],
                            [{
                                text: `${ctx.i18n.t('menuBack')}`,
                                callback_data: 'back'
                            }], [{
                            text: `${ctx.i18n.t('menuMainBack')}`,
                            callback_data: 'mainback'
                        }]]);
                }))
            } else {
                ctx.session.currentProps.multiQtymsg = ctx.reply(`${ctx.i18n.t('catalogClotheMultipleQuantity')}`, Extra.markup(markup => {
                    return markup.inlineKeyboard([...ctx.session.currentProps.multiplePrintMarkup, [{
                        text: `${ctx.i18n.t('menuBack')}`,
                        callback_data: 'back'
                    }], [{
                        text: `${ctx.i18n.t('menuMainBack')}`,
                        callback_data: 'mainback'
                    }]]);
                }))
            }
        } else if (methodType === 'p') {
            ctx.session.currentProps.multiplePrintMarkup.map(m => {
                const quantity = Number(m[1].text.split(' ')[1]);
                if (m[1].text.split(' ')[0] === size) {
                    m[1].text = `${size} ${quantity + 1}`;
                    ctx.session.currentProps.multipleSizes[`${size}`] = quantity + 1;
                }
                return m
            });

            ctx.deleteMessage((await ctx.session.currentProps.multiQtymsg).message_id);

            if (Object.keys(ctx.session.currentProps.multipleSizes).length > 0) {
                ctx.session.currentProps.multiQtymsg = ctx.reply(`${ctx.i18n.t('catalogClotheMultipleQuantity')}`, Extra.markup(markup => {
                    return markup.inlineKeyboard(
                        [...ctx.session.currentProps.multiplePrintMarkup,
                            [{text: `${ctx.i18n.t('catalogClotheContinue')}`, callback_data: 'continue'}],
                            [{
                                text: `${ctx.i18n.t('menuBack')}`,
                                callback_data: 'back'
                            }], [{
                            text: `${ctx.i18n.t('menuMainBack')}`,
                            callback_data: 'mainback'
                        }]]);
                }))
            } else {
                ctx.session.currentProps.multiQtymsg = ctx.reply(`${ctx.i18n.t('catalogClotheMultipleQuantity')}`, Extra.markup(markup => {
                    return markup.inlineKeyboard([...ctx.session.currentProps.multiplePrintMarkup, [{
                        text: `${ctx.i18n.t('menuBack')}`,
                        callback_data: 'back'
                    }], [{
                        text: `${ctx.i18n.t('menuMainBack')}`,
                        callback_data: 'mainback'
                    }]]);
                }))
            }
        }


    })

    return catalogueSceneMultipleQuantity;
}

module.exports.catalogueAddToCartScene = (bot, I18n) => {
    const catalogueAddToCartScene = new Scene('catalogueAddToCartScene');

    catalogueAddToCartScene.enter(async (ctx) => {

        if (ctx.session.currentProps.multiQtymsg) {
            ctx.deleteMessage(await (ctx.session.currentProps.multiQtymsg).message_id);
        }

        let msg = '';


        if (typeof (ctx.session.currentProps.clotheQuantity) === 'object') {
            for (const [key, value] of Object.entries(ctx.session.currentProps.clotheQuantity)) {
                msg += `\n\t\t${key}: ${value}`;
            }
            //
            // console.log({
            //     clotheType: ctx.session.currentProps.clotheType,
            //     clotheName: ctx.session.currentProps.clotheName,
            //     clotheVariation: ctx.session.currentProps.clotheVariation,
            //     clotheSize: ctx.session.currentProps.clotheSize,
            //     clotheQuantity: ctx.session.currentProps.clotheQuantity,
            //     clothePrice: ctx.session.currentProps.pendingPrice,
            //     clotheShotPrice: ctx.session.currentProps.clothePrice
            // })

            ctx.session.catalogueCart.push({
                clotheType: ctx.session.currentProps.clotheType,
                clotheName: ctx.session.currentProps.clotheName,
                clotheVariation: ctx.session.currentProps.clotheVariation,
                clotheSize: ctx.session.currentProps.clotheSize,
                clotheQuantity: ctx.session.currentProps.clotheQuantity,
                clothePrice: ctx.session.currentProps.pendingPrice,
                clotheShotPrice: ctx.session.currentProps.clothePrice
            })
        } else {
            ctx.session.catalogueCart.push({
                clotheType: ctx.session.currentProps.clotheType,
                clotheName: ctx.session.currentProps.clotheName,
                clotheVariation: ctx.session.currentProps.clotheVariation,
                clotheSize: ctx.session.currentProps.clotheSize,
                clotheQuantity: ctx.session.currentProps.clotheQuantity,
                clothePrice: ctx.session.currentProps.pendingPrice,
                clotheShotPrice: ctx.session.currentProps.clothePrice
            })
            // ctx.session.catalogueCart.push({
            //     clotheType: ctx.session.currentProps.clotheType,
            //     clotheName: ctx.session.currentProps.clotheName,
            //     clotheVariation: ctx.session.currentProps.clotheVariation,
            //     clotheSize: ctx.session.currentProps.clotheSize,
            //     clotheQuantity: ctx.session.currentProps.clotheQuantity,
            //     clothePrice: ctx.session.currentProps.pendingPrice
            // })
        }


        ctx.scene.enter('catalogue', {
            start: ctx.i18n.t('catalogCartAdded')
        })
    })

    catalogueAddToCartScene.hears(I18n.match('menuBack'), ctx => {
        if (ctx.session.currentProps.multipleSizes) {
            if (Object.keys(ctx.session.currentProps.multipleSizes).length > 0) {
                return ctx.scene.enter('catalogueMultipleQuantity')
            }
        }
    })

    catalogueAddToCartScene.hears(I18n.match('menuMainBack'), ctx => {
        ctx.scene.enter('mainMenu', {
            start: `${ctx.i18n.t('mainMenu')}`
        })
    })

    return catalogueAddToCartScene;
}
