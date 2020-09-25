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

        const rMarkup = [`${ctx.i18n.t('menuBack')}`];

        ctx.session.catalogue = await Catalogue.findAll();


        ctx.session.clotheTypes = ctx.session.catalogue.map(data => {
            if (ctx.session.chosenLanguage === 'ru') {
                rMarkup.unshift(data.dataValues.ruName)
                return data.dataValues.ruName;
            } else {
                rMarkup.unshift(data.dataValues.uzName)
                return data.dataValues.uzName;
            }
        })

        const msg = ctx.reply(`${ctx.i18n.t('catalogClotheType')}`, Extra.markup(markup => {
            return markup.keyboard(rMarkup).resize();
        }))
        ctx.session.mesage_filter.push((await msg).message_id);
    });

    catalogueScene.hears(I18n.match('menuBack'), ctx => {
        ctx.scene.enter('mainMenu', {
            start: `${ctx.i18n.t('mainMenu')}`
        })
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


        const rMarkup = [`${ctx.i18n.t('menuBack')}`];

        const variationMarkup = ctx.session.currentProps.variationsArray.map(variation => {
            return [variation];
        })

        const msg = ctx.reply(`${ctx.i18n.t('catalogClotheStyle')}`, Extra.markup(markup => {
            return markup.keyboard([...variationMarkup, rMarkup]).resize();
        }))

        ctx.session.mesage_filter.push((await msg).message_id);
    });

    catalogueVariationScene.hears(I18n.match('menuBack'), (ctx) => {
        ctx.scene.enter('catalogue');
    })

    catalogueVariationScene.on('text', async (ctx) => {
        if (ctx.session.currentProps.variationsArray.includes(ctx.message.text)) {
            ctx.session.currentProps.materialSet = new Set();
            ctx.session.currentProps.clotheVariation = ctx.message.text;


            let clothes

            clothes = await ClotheMaterial.findAll({
                where:
                    {
                        clothe: ctx.session.currentProps.clotheType,
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

                const msg = ctx.replyWithPhoto(`${clothePhoto[0].dataValues.photoUrl}`, {caption: clothePhoto[0].dataValues.captionRu})

                clothes.forEach(clothe => {
                    if (!ctx.session.currentProps.materialSet.has(clothe.dataValues.nameRu)) {
                        ctx.session.currentProps.materialSet.add(clothe.dataValues.nameRu)
                    }
                })
            } else {
               clothePhoto = await ClotheVariation.findAll({
                    where:
                        {
                            nameUz: ctx.session.currentProps.clotheVariation,
                        }
                })
                ctx.session.currentProps.clothePhoto = clothePhoto[0].dataValues.photoUrl;

                const msg = ctx.replyWithPhoto(`${ctx.session.currentProps.clothePhoto}`, {caption: clothePhoto[0].dataValues.captionUz})

                clothes.forEach(clothe => {
                    if (!ctx.session.currentProps.materialSet.has(clothe.dataValues.nameUz)) {
                        ctx.session.currentProps.materialSet.add(clothe.dataValues.nameUz)
                    }
                })
            }

            ctx.session.currentProps.materialArray = Array.from(ctx.session.currentProps.materialSet);

            return ctx.scene.enter('catalogueMaterial')
        }
    })

    return catalogueVariationScene;
}

module.exports.catalogueMaterialScene = (bot, I18n) => {
    const catalogueMaterialScene = new Scene('catalogueMaterial');

    catalogueMaterialScene.enter(async (ctx) => {


        const rMarkup = [`${ctx.i18n.t('menuBack')}`];

        const materialMarkup = ctx.session.currentProps.materialArray.map(variation => {
            return [variation];
        })

        const msg = ctx.reply(`${ctx.i18n.t('catalogClotheMaterial')}`, Extra.markup(markup => {
            return markup.keyboard([...materialMarkup, rMarkup]).resize();
        }))

        ctx.session.mesage_filter.push((await msg).message_id);
    });

    catalogueMaterialScene.hears(I18n.match('menuBack'), (ctx) => {
        ctx.scene.enter('catalogueVariation');
    })

    catalogueMaterialScene.on('text', async (ctx) => {
            ctx.session.currentProps.sizeSet = new Set();

            if (ctx.session.currentProps.materialArray.includes(ctx.message.text)) {
                ctx.session.currentProps.materialType = ctx.message.text;

                let clothes = await ClotheSize.findAll({
                    where:
                        {
                            clothe: ctx.session.currentProps.clotheType
                        }
                })

                if (ctx.session.chosenLanguage === 'ru') {
                    clothePhoto = await ClotheMaterial.findAll({
                        where:
                            {
                                nameRu: ctx.session.currentProps.materialType,
                            }
                    })

                    const msg = ctx.replyWithPhoto(`${clothePhoto[0].dataValues.photoUrl}`, {caption: clothePhoto[0].dataValues.captionRu})

                } else {
                    clothePhoto = await ClotheMaterial.findAll({
                        where:
                            {
                                nameUz: ctx.session.currentProps.materialType,
                            }
                    })

                    const msg = ctx.replyWithPhoto(`${clothePhoto[0].dataValues.photoUrl}`, {caption: clothePhoto[0].dataValues.captionUz})

                }

                clothes.forEach(clothe => {
                    if (!ctx.session.currentProps.sizeSet.has(clothe.dataValues.size)) {
                        ctx.session.currentProps.sizeSet.add(clothe.dataValues.size)
                    }
                })
            }


            ctx.session.currentProps.sizeArray = Array.from(ctx.session.currentProps.sizeSet);

            return ctx.scene.enter('catalogueSize');

        }
    )

    return catalogueMaterialScene;
}

module.exports.catalogueSizeScene = (bot, I18n) => {
    const catalogueSizeScene = new Scene('catalogueSize');

    catalogueSizeScene.enter(async (ctx) => {
    const rMarkup = [`${ctx.i18n.t('menuBack')}`];

        ctx.session.currentProps.clotheSize = [];

        ctx.session.currentProps.sizeMarkup = ctx.session.currentProps.sizeArray.map(variation => {
            return [variation];
        })
        ctx.session.currentProps.sizeMarkupInitLength = ctx.session.currentProps.sizeMarkup.length;

        const msg = ctx.reply(`${ctx.i18n.t('catalogClotheSize')}`, Extra.markup(markup => {
            return markup.keyboard([...ctx.session.currentProps.sizeMarkup, rMarkup]).resize();
        }))

        ctx.session.mesage_filter.push((await msg).message_id);
    })

    catalogueSizeScene.hears(I18n.match('menuBack'), (ctx) => {
        ctx.scene.enter('catalogueMaterial');
    })

    catalogueSizeScene.on('text', async (ctx) => {
        const rMarkup = [`${ctx.i18n.t('menuBack')}`];

        if (ctx.message.text === `${ctx.i18n.t('catalogClotheContinue')}` && ctx.session.currentProps.clotheSize.length > 0) {
            if (ctx.session.currentProps.clotheSize.length === 1) {
                // console.log('solo');
                return ctx.scene.enter('catalogueQuantity');
            } else {
                // console.log('multiple');
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
                    return markup.keyboard([...ctx.session.currentProps.sizeMarkup, rMarkup]).resize()
                }));

            } else {
                ctx.session.currentProps.clotheSize.push(ctx.message.text.split(' ')[0]);
                const addingCheck = ctx.session.currentProps.sizeMarkup.filter((clothe, index) => {
                    return clothe[0] === ctx.message.text
                })
                console.log(addingCheck);
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
                    return markup.keyboard([...ctx.session.currentProps.sizeMarkup, rMarkup]).resize()
                }));
            }

        }

    })

    return catalogueSizeScene;
}

module.exports.catalogueQuantityScene = (bot, I18n) => {
    const catalogueQuantityScene = new Scene('catalogueQuantity');

    catalogueQuantityScene.enter(async (ctx) => {
        const rMarkup = [`${ctx.i18n.t('menuBack')}`];

        const msg = ctx.reply(`${ctx.i18n.t('catalogClotheQuantity')}`, Extra.markup(markup => {
            return markup.keyboard([['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], rMarkup]).resize();
        }))

        ctx.session.mesage_filter.push((await msg).message_id);
    })

    catalogueQuantityScene.hears(I18n.match('menuBack'), (ctx) => {
        ctx.scene.enter('catalogueSize');
    })

    catalogueQuantityScene.on('text', async (ctx) => {
        try {
            const integerified = Number.parseInt(ctx.message.text);
            if (integerified) {
                ctx.session.currentProps.clotheQuantity = integerified;
                ctx.scene.enter('catalogueContactName');
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
            }]]);
        }))

    });

    catalogueSceneMultipleQuantity.action('back', ctx => {
        ctx.scene.enter('catalogueSize')
    })

    catalogueSceneMultipleQuantity.action('continue', ctx => {

        if (Object.keys(ctx.session.currentProps.multipleSizes).length > 0) {
            ctx.scene.enter('catalogueContactName')
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
                            }]]);
                }))
            } else {
                ctx.session.currentProps.multiQtymsg = ctx.reply(`${ctx.i18n.t('catalogClotheMultipleQuantity')}`, Extra.markup(markup => {
                    return markup.inlineKeyboard([...ctx.session.currentProps.multiplePrintMarkup, [{
                        text: `${ctx.i18n.t('menuBack')}`,
                        callback_data: 'back'
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
                            }]]);
                }))
            } else {
                ctx.session.currentProps.multiQtymsg = ctx.reply(`${ctx.i18n.t('catalogClotheMultipleQuantity')}`, Extra.markup(markup => {
                    return markup.inlineKeyboard([...ctx.session.currentProps.multiplePrintMarkup, [{
                        text: `${ctx.i18n.t('menuBack')}`,
                        callback_data: 'back'
                    }]]);
                }))
            }
        }


    })

    return catalogueSceneMultipleQuantity;
}


module.exports.catalogueContactNameScene = (bot, I18n) => {
    const catalogueContactNameScene = new Scene('catalogueContactName');

    catalogueContactNameScene.enter(async (ctx) => {
        const rMarkup = [`${ctx.i18n.t('menuBack')}`];

        const msg = ctx.reply(`${ctx.i18n.t('catalogClotheContactName')}`, Extra.markup(markup => {
            return markup.keyboard([rMarkup]).resize();
        }))

        ctx.session.mesage_filter.push((await msg).message_id);
    })

    catalogueContactNameScene.hears(I18n.match('menuBack'), (ctx) => {
        if(ctx.session.currentProps.multipleSizes) {
            if (Object.keys(ctx.session.currentProps.multipleSizes).length > 0) {
                return ctx.scene.enter('catalogueMultipleQuantity')
            }
        }
        return ctx.scene.enter('catalogueQuantity');
    })

    catalogueContactNameScene.on('text', async (ctx) => {
        ctx.session.currentProps.clotheContactName = ctx.message.text;
        ctx.scene.enter('catalogueContactPhone');
    })

    return catalogueContactNameScene;
}

module.exports.catalogueContactPhoneScene = (bot, I18n) => {
    const catalogueContactPhoneScene = new Scene('catalogueContactPhone');

    catalogueContactPhoneScene.enter(async (ctx) => {
        const rMarkup = [`${ctx.i18n.t('menuBack')}`];

        const msg = ctx.reply(`${ctx.i18n.t('catalogClotheContactPhone')}`, Extra.markup(markup => {
            return markup.keyboard([rMarkup]).resize();
        }))

        ctx.session.mesage_filter.push((await msg).message_id);
    })

    catalogueContactPhoneScene.hears(I18n.match('menuBack'), (ctx) => {
        ctx.scene.enter('catalogueContactName');
    })

    catalogueContactPhoneScene.on('text', async (ctx) => {
        ctx.session.currentProps.catalogueContactPhone = ctx.message.text;
        ctx.scene.enter('catalogueLocation')
    })

    return catalogueContactPhoneScene;
}

module.exports.catalogueContactLocationScene = (bot, I18n) => {
    const catalogueContactLocationScene = new Scene('catalogueLocation');

    catalogueContactLocationScene.enter(async (ctx) => {
        ctx.session.currentProps.catalogueContactAdress = '';
        const rMarkup = [`${ctx.i18n.t('menuBack')}`];

        const msg = ctx.reply(`${ctx.i18n.t('catalogClotheAskLocaction')}`, Extra.markup(markup => {
            return markup.keyboard([[markup.locationRequestButton(`${ctx.i18n.t('catalogClotheSendLocation')}`)],rMarkup]).resize();
        }))

        ctx.session.mesage_filter.push((await msg).message_id);
    })

    catalogueContactLocationScene.hears(I18n.match('menuBack'), (ctx) => {
        ctx.scene.enter('catalogueContactPhone');
    })

    catalogueContactLocationScene.on('location', async (ctx) => {
        ctx.session.currentProps.catalogueContactAdressLatLon = ctx.message.location;
        ctx.scene.enter('catalogueEndScene')
    })

    catalogueContactLocationScene.on('text', async (ctx) => {
        ctx.session.currentProps.catalogueContactAdress = ctx.message.text;
        ctx.scene.enter('catalogueEndScene')
    })

    return catalogueContactLocationScene;
}

module.exports.catalogueEndScene = (bot, I18n) => {


    const catalogueEndScene = new Scene('catalogueEndScene');

    catalogueEndScene.enter(async (ctx) => {
        // if (ctx.session.mesage_filter.length !== 0) {
        //     ctx.session.mesage_filter.forEach(msg => {
        //         ctx.deleteMessage(msg)
        //     })
        // }

        const rMarkup = [`${ctx.i18n.t('menuBack')}`];


        const singleQuantityMsg = `
<b>${ctx.i18n.t('catalogClothConfirmClotheSize')}:</b> ${ctx.session.currentProps.clotheSize}
<b>${ctx.i18n.t('catalogClothConfirmClotheQuantity')}:</b> ${ctx.session.currentProps.clotheQuantity}`

        let multiQuantityMsg;

        if(ctx.session.currentProps.multipleSizes) {
            if (Object.keys(ctx.session.currentProps.multipleSizes).length > 0) {

                let markupText = '';
                for (const [key, value] of Object.entries(ctx.session.currentProps.multipleSizes)) {
                    markupText += `\n<i>${ctx.i18n.t('catalogClothConfirmClotheSSize')}</i>: ${key}, <i>${ctx.i18n.t('catalogClothConfirmClotheSQty')}</i>: ${value}`;
                }

                multiQuantityMsg = `
<b>${ctx.i18n.t('catalogClothConfirmClotheMQty')}:</b> ${markupText}`
            }
        }

        let writtenAdress;

        if(ctx.session.currentProps.catalogueContactAdress){
            writtenAdress = `<b>${ctx.i18n.t('catalogClothConfirmClotheAdress')}:</b> ${ctx.session.currentProps.catalogueContactAdress}`;
        }

        ctx.session.currentProps.endMarkup = `
<b>${ctx.i18n.t('catalogClothConfirmClotheType')}:</b> ${ctx.session.currentProps.clotheName}
<b>${ctx.i18n.t('catalogClothConfirmClotheStyle')}:</b> ${ctx.session.currentProps.clotheVariation}
<b>${ctx.i18n.t('catalogClothConfirmClotheMat')}:</b> ${ctx.session.currentProps.materialType}
${multiQuantityMsg ? multiQuantityMsg : singleQuantityMsg}
<b>${ctx.i18n.t('catalogClothConfirmClotheContact')}:</b> ${ctx.session.currentProps.clotheContactName}
<b>${ctx.i18n.t('catalogClothConfirmClotheNumber')}:</b> ${ctx.session.currentProps.catalogueContactPhone}
${writtenAdress ? writtenAdress : '\n'}`

        const msg = ctx.replyWithPhoto(`${ctx.session.currentProps.clothePhoto}`, {caption: ctx.session.currentProps.endMarkup, parse_mode: 'HTML'})


        const msg_1 = ctx.replyWithHTML()

        const msg_2 = ctx.reply(`${ctx.i18n.t('catalogClotheConfirm')}`, Extra.markup(markup => {
            return markup.keyboard([[`${ctx.i18n.t('catalogClotheConfirmed')}`], rMarkup]).resize();
        }))

        ctx.session.mesage_filter.push((await msg_1).message_id);
        ctx.session.mesage_filter.push((await msg_2).message_id);


    })

    catalogueEndScene.hears(I18n.match('menuBack'), (ctx) => {
        ctx.scene.enter('catalogueLocation');
    })

    catalogueEndScene.on('text', async (ctx) => {
        if (ctx.message.text === `${ctx.i18n.t('catalogClotheConfirmed')}`) {

            await bot.telegram.sendPhoto('-1001323833574', ctx.session.currentProps.clothePhoto,
                {parse_mode: "HTML", caption: ctx.session.currentProps.endMarkup})
            if (ctx.session.currentProps.catalogueContactAdressLatLon) {
                await bot.telegram.sendLocation('-1001323833574',
                    ctx.session.currentProps.catalogueContactAdressLatLon.latitude,
                    ctx.session.currentProps.catalogueContactAdressLatLon.longitude);
            }

            ctx.scene.enter('mainMenu', {
                start: `${ctx.i18n.t('requestCompleteMsg')}`
            })
        }
    })

    return catalogueEndScene;
}
