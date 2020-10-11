const Scene = require('telegraf/scenes/base');
const {Telegraf} = require('telegraf');
const {Extra} = Telegraf;
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

sharp.cache(false);

const Catalogue = require('./../models/Catalogue');
const PrintingColors = require('./../models/PrintingColors');
const PrintingShape = require('./../models/PrintingShape');

const PrintingDetails = require('../models/PrintingDetails');

module.exports.printingSceneClothe = (bot, I18n) => {
    const printingSceneClothe = new Scene('printing');

    printingSceneClothe.enter(async (ctx) => {


        ctx.session.printingProps = {};

        const clothes = await Catalogue.findAll();

        ctx.session.printingProps.clothesData = clothes.map(clothe => {
            return clothe.dataValues;
        })

        const clotheMarkup = clothes.map(clothe => {
            if (ctx.session.chosenLanguage === 'ru') {
                return [clothe.dataValues.ruName]
            } else {
                return [clothe.dataValues.uzName]
            }
        })

        ctx.session.clothesArray = clotheMarkup.map(clothe => clothe[0]);

        const msg = ctx.reply(`${ctx.i18n.t('catalogClotheType')}`, Extra.markup(markup => {
            return markup.keyboard([
                ...clotheMarkup,
                [`${ctx.i18n.t('menuBack')}`]
            ]).resize();
        }))
        ctx.session.mesage_filter.push((await msg).message_id);
    });

    printingSceneClothe.hears(I18n.match('menuBack'), ctx => {
        ctx.scene.enter('mainMenu', {
            start: ctx.i18n.t('mainMenu')
        })
    })

    printingSceneClothe.hears(I18n.match('menuMainBack'), ctx => {
        ctx.scene.enter('mainMenu', {
            start: ctx.i18n.t('mainMenu')
        })
    })

    printingSceneClothe.on('text', ctx => {
        if (ctx.session.clothesArray.includes(ctx.message.text)) {

            const clotheID = ctx.session.printingProps.clothesData.filter(clothe => {
                if (ctx.session.chosenLanguage === 'ru') {
                    return clothe.ruName === ctx.message.text;
                } else {
                    return clothe.uzName === ctx.message.text;
                }
            })

            ctx.session.printingProps.printClothe = clotheID[0].ID;
            ctx.scene.enter('printingSceneClotheColor')
        }
    })


    return printingSceneClothe

}

module.exports.printingSceneClotheColor = (bot, I18n) => {
    const printingSceneClotheColor = new Scene('printingSceneClotheColor');

    printingSceneClotheColor.enter(async (ctx) => {


        const clothes = await PrintingColors.findAll();

        ctx.session.printingProps.clothesDataColors = clothes.map(clothe => {
            return clothe.dataValues;
        })

        const clotheMarkup = clothes.map(clothe => {
            if (ctx.session.chosenLanguage === 'ru') {
                return [clothe.dataValues.nameRu]
            } else {
                return [clothe.dataValues.nameUz]
            }
        })

        ctx.session.clotheColorArray = clotheMarkup.map(clothe => clothe[0]);

        const msg = ctx.reply(`${ctx.i18n.t('catalogClotheColor')}`, Extra.markup(markup => {
            return markup.keyboard([
                ...clotheMarkup,
                [`${ctx.i18n.t('menuBack')}`],
                [`${ctx.i18n.t('menuMainBack')}`],
            ]).resize();
        }))
        ctx.session.mesage_filter.push((await msg).message_id);
    });

    printingSceneClotheColor.hears(I18n.match('menuMainBack'), ctx => {
        ctx.scene.enter('mainMenu', {
            start: ctx.i18n.t('mainMenu')
        })
    })

    printingSceneClotheColor.hears(I18n.match('menuBack'), ctx => {
        ctx.scene.enter('printing');
    })

    printingSceneClotheColor.on('text', ctx => {
        if (ctx.session.clotheColorArray.includes(ctx.message.text)) {

            const color = ctx.session.printingProps.clothesDataColors.filter(clothe => {
                if (ctx.session.chosenLanguage === 'ru') {
                    return clothe.nameRu === ctx.message.text
                } else {
                    return clothe.nameUz === ctx.message.text
                }
            })

            // console.log(color);

            ctx.session.printingProps.printClotheColor = [color[0].photoFront, color[0].photoBack];

            ctx.scene.enter('printingStyle')
        }
    })


    return printingSceneClotheColor

}



module.exports.printingStyleScene = (bot, I18n) => {
    const printingStyleScene = new Scene('printingStyle');

    printingStyleScene.enter(async (ctx) => {


        const styles = await PrintingDetails.findAll({where: {clothe: ctx.session.printingProps.printClothe}});

        ctx.session.printingProps.printArray = [];

        const styleMarkup = styles.map(style => {
            if (ctx.session.chosenLanguage === 'ru') {
                ctx.session.printingProps.printArray.push(style.dataValues.nameRu);
                return [style.dataValues.nameRu]
            } else {
                ctx.session.printingProps.printArray.push(style.dataValues.nameUz);
                return [style.dataValues.nameUz]
            }
        })


        const msg = ctx.reply(`${ctx.i18n.t('printingStyle')}`, Extra.markup(markup => {
            return markup.keyboard([
                ...styleMarkup
                , [`${ctx.i18n.t('menuBack')}`],
                [`${ctx.i18n.t('menuMainBack')}`]
            ]).resize();
        }))
        ctx.session.mesage_filter.push((await msg).message_id);
    });

    printingStyleScene.hears(I18n.match('menuBack'), ctx => {
        ctx.scene.enter('printingSceneClotheColor')
    })

    printingStyleScene.hears(I18n.match('menuMainBack'), ctx => {
        ctx.scene.enter('mainMenu', {
            start: ctx.i18n.t('mainMenu')
        })
    })


    printingStyleScene.on('text', ctx => {
        if (ctx.session.printingProps.printArray.includes(ctx.message.text)) {
            ctx.session.printingCoordinatesName = ctx.message.text;
            ctx.scene.enter('printingSceneClotheShape')
        }
    })


    return printingStyleScene;
}


module.exports.printingSceneClotheShape = (bot, I18n) => {
    const printingSceneClotheShape = new Scene('printingSceneClotheShape');

    printingSceneClotheShape.enter(async (ctx) => {


        const clothes = await PrintingShape.findAll();

        ctx.session.printingProps.clothesDataShapes = clothes.map(clothe => {
            return clothe.dataValues;
        })

        const clotheMarkup = clothes.map(clothe => {
            if (ctx.session.chosenLanguage === 'ru') {
                return [clothe.dataValues.nameRu]
            } else {
                return [clothe.dataValues.nameUz]
            }
        })

        ctx.session.clotheShapeArray = clotheMarkup.map(clothe => clothe[0]);

        const msg = ctx.reply(`${ctx.i18n.t('catalogClotheShape')}`, Extra.markup(markup => {
            return markup.keyboard([
                ...clotheMarkup,
                [`${ctx.i18n.t('menuBack')}`],
                [`${ctx.i18n.t('menuMainBack')}`],
            ]).resize();
        }))
        ctx.session.mesage_filter.push((await msg).message_id);
    });

    printingSceneClotheShape.hears(I18n.match('menuMainBack'), ctx => {
        ctx.scene.enter('mainMenu', {
            start: ctx.i18n.t('mainMenu')
        })
    })

    printingSceneClotheShape.hears(I18n.match('menuBack'), ctx => {
        ctx.scene.enter('printingStyle');
    })

    printingSceneClotheShape.on('text', ctx => {
        if (ctx.session.clotheShapeArray.includes(ctx.message.text)) {

            const color = ctx.session.printingProps.clothesDataShapes.filter(clothe => {
                if (ctx.session.chosenLanguage === 'ru') {
                    return clothe.nameRu === ctx.message.text
                } else {
                    return clothe.nameUz === ctx.message.text
                }
            })

            console.log(color);

            ctx.session.printingProps.printClotheShape = color[0].type;

            ctx.scene.enter('printingEnter')
        }
    })


    return printingSceneClotheShape

}

module.exports.printingSceneEnter = (bot, I18n) => {
    const printingScene = new Scene('printingEnter');

    printingScene.enter(async (ctx) => {
        const msg = ctx.reply(`${ctx.i18n.t('printingPhotoSend')}`, Extra.markup(markup => {
            return markup.keyboard([
                [`${ctx.i18n.t('menuBack')}`],
                [`${ctx.i18n.t('menuMainBack')}`]
            ]).resize();
        }))
        ctx.session.mesage_filter.push((await msg).message_id);
    });

    printingScene.hears(I18n.match('menuBack'), ctx => {
        ctx.scene.enter('printingSceneClotheShape');
    })

    printingScene.hears(I18n.match('menuMainBack'), ctx => {
        ctx.scene.enter('mainMenu', {
            start: ctx.i18n.t('mainMenu')
        })
    })


    printingScene.on('document', async ctx => {
        console.log(ctx.message);
        const type = ctx.message.document.mime_type.split('/')[1];
        if(type === 'png'){
            cloothe(ctx, ctx.message.document.file_id);
        } else {
            ctx.reply(`${ctx.i18n.t('catalogClothePng')}`);
        }
    })

    printingScene.on('photo', async ctx => {
        cloothe(ctx);
    })

    printingScene.hears(I18n.match('printingOrder'), ctx => {
        ctx.scene.enter('printingSize')
    })


    return printingScene

}


module.exports.printingSizeScene = (bot, I18n) => {
    const printingSizeScene = new Scene('printingSize');

    printingSizeScene.enter(async (ctx) => {
        const rMarkup = [`${ctx.i18n.t('menuBack')}`];

        ctx.session.printingProps.sizeArray = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        ctx.session.printingProps.sizeMarkup = [['XS'], ['S'], ['M'], ['L'], ['XL'], ['XXL']];

        ctx.session.printingProps.clotheSize = [];
        const msg = ctx.reply(`${ctx.i18n.t('catalogClotheSize')}`, Extra.markup(markup => {
            return markup.keyboard([...ctx.session.printingProps.sizeMarkup, rMarkup, [`${ctx.i18n.t('menuMainBack')}`]]).resize();
        }))

        ctx.session.mesage_filter.push((await msg).message_id);
    })

    printingSizeScene.hears(I18n.match('menuBack'), (ctx) => {
        ctx.scene.enter('printingEnter');
    })

    printingSizeScene.hears(I18n.match('menuMainBack'), ctx => {
        ctx.scene.enter('mainMenu', {
            start: ctx.i18n.t('mainMenu')
        })
    })

    printingSizeScene.on('text', async (ctx) => {

        if (ctx.message.text === `${ctx.i18n.t('catalogClotheContinue')}` && ctx.session.printingProps.clotheSize.length > 0) {
            if (ctx.session.printingProps.clotheSize.length === 1) {
                ctx.scene.enter('printingQuantity');
            } else {
                ctx.scene.enter('printingMultipleQuantity');
            }
        }

        const rMarkup = [`${ctx.i18n.t('menuBack')}`];
        if (ctx.session.printingProps.sizeArray.includes(ctx.message.text) || ctx.session.printingProps.sizeArray.includes(ctx.message.text.split(' ')[0])) {
            if (ctx.session.printingProps.clotheSize.includes(ctx.message.text) || ctx.session.printingProps.clotheSize.includes(ctx.message.text.split(' ')[0])) {
                let pos = ctx.session.printingProps.clotheSize.indexOf(ctx.message.text.split(' ')[0])
                ctx.session.printingProps.clotheSize.splice(pos, 1);
                const addingCheck = ctx.session.printingProps.sizeMarkup.filter((clothe, index) => {
                    return clothe[0] === ctx.message.text
                });

                ctx.session.printingProps.sizeMarkup.map(clothe => {
                    if (clothe[0] === addingCheck[0][0]) {
                        const text = clothe[0].split(' ');
                        clothe[0] = text[0];
                    }
                })

                if (ctx.session.printingProps.clotheSize.length === 0) {
                    if (ctx.session.printingProps.sizeMarkup.length > 6) {
                        let pos = ctx.session.printingProps.sizeMarkup.indexOf([`${ctx.i18n.t('catalogClotheContinue')}`])
                        ctx.session.printingProps.sizeMarkup.splice(pos, 1);
                    }
                }

                ctx.reply(`${ctx.i18n.t('catalogClotheSize')}`, Extra.markup(markup => {
                    return markup.keyboard([...ctx.session.printingProps.sizeMarkup, rMarkup, [`${ctx.i18n.t('menuMainBack')}`]]).resize()
                }));

            } else {
                ctx.session.printingProps.clotheSize.push(ctx.message.text.split(' ')[0]);
                const addingCheck = ctx.session.printingProps.sizeMarkup.filter((clothe, index) => {
                    return clothe[0] === ctx.message.text
                })
                ctx.session.printingProps.sizeMarkup.map(clothe => {
                    if (clothe[0] === addingCheck[0][0]) {
                        clothe[0] = clothe[0] + ' ✅'
                    }
                })

                if (ctx.session.printingProps.clotheSize.length >= 1) {
                    if (ctx.session.printingProps.sizeMarkup.length === 6) {
                        ctx.session.printingProps.sizeMarkup.push([`${ctx.i18n.t('catalogClotheContinue')}`])
                    }
                }

                ctx.reply(`${ctx.i18n.t('catalogClotheSize')}`, Extra.markup(markup => {
                    return markup.keyboard([...ctx.session.printingProps.sizeMarkup, rMarkup, [`${ctx.i18n.t('menuMainBack')}`]]).resize()
                }));
            }

        }

    })

    return printingSizeScene;
}

module.exports.printingSceneQuantity = (bot, I18n) => {
    const printingSceneQuantity = new Scene('printingQuantity');

    printingSceneQuantity.enter(async (ctx) => {
        if (ctx.session.printingProps.clotheSize.length === 1) {
            const msg = ctx.reply(`${ctx.i18n.t('catalogClotheQuantity')}`, Extra.markup(markup => {
                return markup.keyboard([['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], [`${ctx.i18n.t('menuBack')}`], [`${ctx.i18n.t('menuMainBack')}`]]).resize();
            }))
            ctx.session.mesage_filter.push((await msg).message_id);
        }
    });

    printingSceneQuantity.hears(I18n.match('menuBack'), ctx => {
        ctx.scene.enter('printingSize')
    })

    printingSceneQuantity.hears(I18n.match('menuMainBack'), ctx => {
        ctx.scene.enter('mainMenu', {
            start: ctx.i18n.t('mainMenu')
        })
    })

    printingSceneQuantity.on('text', async ctx => {
        try {
            const integerified = Number.parseInt(ctx.message.text);
            if (integerified) {
                ctx.session.printingProps.printClotheQuantity = integerified;
                ctx.session.printingProps.multipleSizes = {};
                ctx.scene.enter('printingContactName')
            }
        } catch (e) {
            console.log(e);
        }
    })

    return printingSceneQuantity;
}

module.exports.printingSceneMultipleQuantity = (bot, I18n) => {
    const printingSceneMultipleQuantity = new Scene('printingMultipleQuantity');

    printingSceneMultipleQuantity.enter(async (ctx) => {

        ctx.session.printingProps.multipleSizes = {};

        ctx.session.printingProps.multiplePrintMarkup = ctx.session.printingProps.clotheSize.map(size => {
            return [
                {text: '➖', callback_data: `s:m:${size}`},
                {text: `${size} 0`, callback_data: `s:s:${size}`},
                {text: '➕', callback_data: `s:p:${size}`}]
        });


        const msg_2 = ctx.reply(`${ctx.i18n.t('catalogClotheMultipleQuantity')}`, Extra.markup(markup => {
            return markup.removeKeyboard(true);
        }))

        ctx.deleteMessage((await msg_2).message_id);

        ctx.session.printingProps.multiQtymsg = ctx.reply(`${ctx.i18n.t('catalogClotheMultipleQuantity')}`, Extra.markup(markup => {
            return markup.inlineKeyboard([...ctx.session.printingProps.multiplePrintMarkup, [{
                text: `${ctx.i18n.t('menuBack')}`,
                callback_data: 'back'
            }],  [{
                text: `${ctx.i18n.t('menuMainBack')}`,
                callback_data: 'menuMainBack'
            }]]);
        }))

    });

    printingSceneMultipleQuantity.action('back', ctx => {

        ctx.scene.enter('printingSize')
    })

    printingSceneMultipleQuantity.action('continue', ctx => {

        if (Object.keys(ctx.session.printingProps.multipleSizes).length > 0) {
            ctx.scene.enter('printingContactName')
        }

    })

    printingSceneMultipleQuantity.action('menuMainBack', ctx => {
        ctx.scene.enter('mainMenu', {
            start: ctx.i18n.t('mainMenu')
        })
    })


    printingSceneMultipleQuantity.on('callback_query', async ctx => {


        const [type, methodType, size] = ctx.callbackQuery.data.split(':');
        ctx.answerCbQuery();

        if (methodType === 'm') {
            ctx.session.printingProps.multiplePrintMarkup.map(m => {
                const quantity = m[1].text.split(' ')[1];
                if (m[1].text.split(' ')[0] === size && quantity > 0) {
                    m[1].text = `${size} ${quantity - 1}`;
                    ctx.session.printingProps.multipleSizes[`${size}`] = quantity - 1;
                    if (ctx.session.printingProps.multipleSizes[`${size}`] === 0) {
                        delete ctx.session.printingProps.multipleSizes[`${size}`]
                    }
                }
                return m
            })

            ctx.deleteMessage((await ctx.session.printingProps.multiQtymsg).message_id);

            if (Object.keys(ctx.session.printingProps.multipleSizes).length > 0) {
                ctx.session.printingProps.multiQtymsg = ctx.reply(`${ctx.i18n.t('catalogClotheMultipleQuantity')}`, Extra.markup(markup => {
                    return markup.inlineKeyboard(
                        [...ctx.session.printingProps.multiplePrintMarkup,
                            [{text: `${ctx.i18n.t('catalogClotheContinue')}`, callback_data: 'continue'}],
                            [{
                                text: `${ctx.i18n.t('menuBack')}`,
                                callback_data: 'back'
                            }],  [{
                            text: `${ctx.i18n.t('menuMainBack')}`,
                            callback_data: 'menuMainBack'
                        }]]);
                }))
            } else {
                ctx.session.printingProps.multiQtymsg = ctx.reply(`${ctx.i18n.t('catalogClotheMultipleQuantity')}`, Extra.markup(markup => {
                    return markup.inlineKeyboard([...ctx.session.printingProps.multiplePrintMarkup, [{
                        text: `${ctx.i18n.t('menuBack')}`,
                        callback_data: 'back'
                    }],  [{
                        text: `${ctx.i18n.t('menuMainBack')}`,
                        callback_data: 'menuMainBack'
                    }]]);
                }))
            }
            ctx.session.mesage_filter.push((await msg).message_id);
        } else if (methodType === 'p') {
            ctx.session.printingProps.multiplePrintMarkup.map(m => {
                const quantity = Number(m[1].text.split(' ')[1]);
                if (m[1].text.split(' ')[0] === size) {
                    m[1].text = `${size} ${quantity + 1}`;
                    ctx.session.printingProps.multipleSizes[`${size}`] = quantity + 1;
                }
                return m
            })
            //
            ctx.deleteMessage((await ctx.session.printingProps.multiQtymsg).message_id);


            if (Object.keys(ctx.session.printingProps.multipleSizes).length > 0) {
                ctx.session.printingProps.multiQtymsg = ctx.reply(`${ctx.i18n.t('catalogClotheMultipleQuantity')}`, Extra.markup(markup => {
                    return markup.inlineKeyboard(
                        [...ctx.session.printingProps.multiplePrintMarkup,
                            [{text: `${ctx.i18n.t('catalogClotheContinue')}`, callback_data: 'continue'}],
                            [{
                                text: `${ctx.i18n.t('menuBack')}`,
                                callback_data: 'back'
                            }],  [{
                            text: `${ctx.i18n.t('menuMainBack')}`,
                            callback_data: 'menuMainBack'
                        }]]);
                }))
            } else {
                ctx.session.printingProps.multiQtymsg = ctx.reply(`${ctx.i18n.t('catalogClotheMultipleQuantity')}`, Extra.markup(markup => {
                    return markup.inlineKeyboard([...ctx.session.printingProps.multiplePrintMarkup, [{
                        text: `${ctx.i18n.t('menuBack')}`,
                        callback_data: 'back'
                    }], [{
                        text: `${ctx.i18n.t('menuMainBack')}`,
                        callback_data: 'menuMainBack'
                    }]]);
                }))
            }

        }


    })

    return printingSceneMultipleQuantity;
}


module.exports.printingContactNameScene = (bot, I18n) => {
    const printingContactNameScene = new Scene('printingContactName');

    printingContactNameScene.enter(async (ctx) => {
        const rMarkup = [`${ctx.i18n.t('menuBack')}`];

        const msg = ctx.reply(`${ctx.i18n.t('catalogClotheContactName')}`, Extra.markup(markup => {
            return markup.keyboard([rMarkup, [ctx.i18n.t('menuMainBack')]]).resize();
        }))

        ctx.session.mesage_filter.push((await msg).message_id);
    })

    printingContactNameScene.hears(I18n.match('menuBack'), (ctx) => {
        if (Object.keys(ctx.session.printingProps.multipleSizes).length > 0) {
            return ctx.scene.enter('printingMultipleQuantity')
        }
        return ctx.scene.enter('printingQuantity');
    })

    printingContactNameScene.hears(I18n.match('menuMainBack'), ctx => {
        ctx.scene.enter('mainMenu', {
            start: ctx.i18n.t('mainMenu')
        })
    })

    printingContactNameScene.on('text', async (ctx) => {
        ctx.session.printingProps.printingContactName = ctx.message.text;
        ctx.scene.enter('printingContactPhone');
    })

    return printingContactNameScene;
}

module.exports.printingContactPhoneScene = (bot, I18n) => {
    const printingContactPhoneScene = new Scene('printingContactPhone');

    printingContactPhoneScene.enter(async (ctx) => {
        const rMarkup = [`${ctx.i18n.t('menuBack')}`];

        const msg = ctx.reply(`${ctx.i18n.t('catalogClotheContactPhone')}`, Extra.markup(markup => {
            return markup.keyboard([rMarkup, [ctx.i18n.t('menuMainBack')]]).resize();
        }))

        ctx.session.mesage_filter.push((await msg).message_id);
    })

    printingContactPhoneScene.hears(I18n.match('menuBack'), (ctx) => {
        ctx.scene.enter('printingContactName');
    })

    printingContactPhoneScene.hears(I18n.match('menuMainBack'), ctx => {
        ctx.scene.enter('mainMenu', {
            start: ctx.i18n.t('mainMenu')
        })
    })

    printingContactPhoneScene.on('text', async (ctx) => {
        ctx.session.printingProps.printingContactPhone = ctx.message.text;
        ctx.scene.enter('printingLocation')
    })

    return printingContactPhoneScene;
}


module.exports.printingContactLocationScene = (bot, I18n) => {
    const printingContactLocationScene = new Scene('printingLocation');

    printingContactLocationScene.enter(async (ctx) => {
        ctx.session.printingProps.printingContactAdress = '';
        const rMarkup = [`${ctx.i18n.t('menuBack')}`];

        const msg = ctx.reply(`${ctx.i18n.t('catalogClotheAskLocaction')}`, Extra.markup(markup => {
            return markup.keyboard([[markup.locationRequestButton(`${ctx.i18n.t('catalogClotheSendLocation')}`)], rMarkup, [ctx.i18n.t('menuMainBack')]]).resize();
        }))

        ctx.session.mesage_filter.push((await msg).message_id);
    })

    printingContactLocationScene.hears('◀️ Назад', (ctx) => {
        ctx.scene.enter('printingContactPhone');
    })

    printingContactLocationScene.hears(I18n.match('menuMainBack'), ctx => {
        ctx.scene.enter('mainMenu', {
            start: ctx.i18n.t('mainMenu')
        })
    })

    printingContactLocationScene.on('location', async (ctx) => {
        ctx.session.printingProps.printingContactAdressLatLon = ctx.message.location;
        ctx.scene.enter('printingEndScene')
    })

    printingContactLocationScene.on('text', async (ctx) => {
        ctx.session.printingProps.printingContactAdress = ctx.message.text;
        ctx.scene.enter('printingEndScene')
    })

    return printingContactLocationScene;
}

module.exports.printingEndScene = (bot, I18n) => {


    const printingEndScene = new Scene('printingEndScene');

    printingEndScene.enter(async (ctx) => {
        // if (ctx.session.mesage_filter.length !== 0) {
        //     ctx.session.mesage_filter.forEach(msg => {
        //         ctx.deleteMessage(msg)
        //     })
        // }

        const rMarkup = ['◀️ Назад'];

        const singleQuantityMsg = `
<b>${ctx.i18n.t('catalogClothConfirmClotheSize')}:</b> ${ctx.session.printingProps.clotheSize}
<b>${ctx.i18n.t('catalogClothConfirmClotheQuantity')}:</b> ${ctx.session.printingProps.printClotheQuantity}`
        let multiQuantityMsg;

        if (Object.keys(ctx.session.printingProps.multipleSizes).length > 0) {

            let markupText = '';
            for (const [key, value] of Object.entries(ctx.session.printingProps.multipleSizes)) {
                markupText += `\n<i>${ctx.i18n.t('catalogClothConfirmClotheSSize')}</i>: ${key}, <i>${ctx.i18n.t('catalogClothConfirmClotheSQty')}</i>: ${value}`;
            }

            multiQuantityMsg = `
<b>${ctx.i18n.t('catalogClothConfirmClotheMQty')}:</b> ${markupText}`
        }

        let writtenAdress;

        if (ctx.session.printingProps.printingContactAdress) {
            writtenAdress = `<b>${ctx.i18n.t('catalogClothConfirmClotheAdress')}:</b> ${ctx.session.printingProps.printingContactAdress}`;
        }

        ctx.session.printingProps.endMarkup = `
${multiQuantityMsg ? multiQuantityMsg : singleQuantityMsg}
<b>${ctx.i18n.t('catalogClothConfirmClotheContact')}:</b> ${ctx.session.printingProps.printingContactName}
<b>${ctx.i18n.t('catalogClothConfirmClotheNumber')}:</b> ${ctx.session.printingProps.printingContactPhone}
${writtenAdress ? writtenAdress : '\n'}`

        const msg_1 = ctx.replyWithPhoto({
            source: ctx.session.printingProps.outputPhoto,
            filename: `${ctx.from.id}_finale.jpg`
        }, {
            caption: ctx.session.printingProps.endMarkup, parse_mode: "HTML"
        })

        const msg_2 = ctx.reply(`${ctx.i18n.t('catalogClotheConfirm')}`, Extra.markup(markup => {
            return markup.keyboard([[`${ctx.i18n.t('catalogClotheConfirmed')}`], rMarkup, [ctx.i18n.t('menuMainBack')]]).resize();
        }))

        ctx.session.mesage_filter.push((await msg_1).message_id);
        ctx.session.mesage_filter.push((await msg_2).message_id);


    })

    printingEndScene.hears(I18n.match('menuBack'), (ctx) => {
        ctx.scene.enter('printingLocation');
    })

    printingEndScene.hears(I18n.match('menuMainBack'), ctx => {
        ctx.scene.enter('mainMenu', {
            start: ctx.i18n.t('mainMenu')
        })
    })

    printingEndScene.on('text', async (ctx) => {
        if (ctx.message.text === `${ctx.i18n.t('catalogClotheConfirmed')}`) {

            const pathe = path.resolve(__dirname, '../images', `${ctx.from.id}_inputPhoto.jpg`);

            await bot.telegram.sendPhoto('-1001323833574', {
                source: ctx.session.printingProps.outputPhoto,
                filename: `${ctx.from.id}_finale.jpg`
            }, {parse_mode: "HTML", caption: ctx.session.printingProps.endMarkup})
            if (ctx.session.printingProps.printingContactAdressLatLon) {
                await bot.telegram.sendLocation('-1001323833574',
                    ctx.session.printingProps.printingContactAdressLatLon.latitude,
                    ctx.session.printingProps.printingContactAdressLatLon.longitude);
            }
            await bot.telegram.sendPhoto('-1001323833574', {
                source: pathe,
                filename: `${ctx.from.id}_inputPhoto.png`
            });

            fs.unlink(ctx.session.printingProps.fi, (err) => err ? console.log(err) : null);
            fs.unlink(ctx.session.printingProps.fo, (err) => err ? console.log(err) : null);
            fs.unlink(ctx.session.printingProps.outputPhoto, (err) => err ? console.log(err) : null);
            ctx.scene.enter('mainMenu', {
                start: ctx.i18n.t('requestCompleteMsg')
            })

        }
    })

    return printingEndScene;
}


async function uploadPhoto(ctx, file) {

    let fileUrl;
    if (file){
        fileUrl = `https://api.telegram.org/bot${process.env.TGTOKEN}/getFile?file_id=${file}`
    }else {
        if (ctx.message.photo.length === 3) {
            fileUrl = `https://api.telegram.org/bot${process.env.TGTOKEN}/getFile?file_id=${ctx.message.photo[2].file_id}`
        } else if (ctx.message.photo.length === 2) {
            fileUrl = `https://api.telegram.org/bot${process.env.TGTOKEN}/getFile?file_id=${ctx.message.photo[1].file_id}`
        } else {
            fileUrl = `https://api.telegram.org/bot${process.env.TGTOKEN}/getFile?file_id=${ctx.message.photo[0].file_id}`
        }
    }



    const res = await axios.get(fileUrl);


    const url = `https://api.telegram.org/file/bot${process.env.TGTOKEN}/${res.data.result.file_path}`

    const pathe = path.resolve(__dirname, '../images', `${ctx.from.id}_inputPhoto.png`)
    const writer = await fs.createWriteStream(pathe)

    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    })

    await response.data.pipe(writer)

    return await new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
    })
}

async function cloothe(ctx, file){

    ctx.reply(`${ctx.i18n.t('printingPhotoUploading')}`);

    let printingClothe;
    if (ctx.session.chosenLanguage === 'ru') {
        printingClothe = await PrintingDetails.findAll({where: {nameRu: ctx.session.printingCoordinatesName}})
    } else {
        printingClothe = await PrintingDetails.findAll({where: {nameUz: ctx.session.printingCoordinatesName}})
    }
    const photoName = printingClothe[0].photoName;


    ctx.session.printingProps.fi = path.resolve(__dirname, '../images/', `${ctx.from.id}_inputPhoto.png`);


    ctx.session.printingProps.fo = path.resolve(__dirname, '../images/', `${ctx.from.id}_outputPhoto.png`);
    ctx.session.printingProps.outputPhoto = path.resolve(__dirname, '../images/', `${ctx.from.id}_finale.png`);
    let inputPhoto;
    if (photoName === 'face') {
        inputPhoto = path.resolve(__dirname, '../images/settings', `${ctx.session.printingProps.printClotheColor[0]}`);
    } else if (photoName === 'back') {
        inputPhoto = path.resolve(__dirname, '../images/settings', `${ctx.session.printingProps.printClotheColor[1]}`);
    }

    const ddd = await sharp(inputPhoto)
    const sizes = await ddd.metadata();

    let resizeWidth = Math.floor(sizes.width / printingClothe[0].resizeWidth);
    let resizeHeight = Math.floor(sizes.height / printingClothe[0].resizeHeight);

    if(ctx.session.printingProps.printClotheShape === 'square'){
        resizeHeight = Math.floor(sizes.width / printingClothe[0].resizeHeight);
        resizeWidth = resizeHeight;
    }

    let coordinatex = Math.floor(
        (printingClothe[0].correctionx ?
            (printingClothe[0].correctionx * resizeWidth) : 0)
        + (sizes.width / printingClothe[0].coordinatex) - (resizeWidth / 2)
    );
    let coordinatey = Math.floor(
        (printingClothe[0].correctiony ? (
            printingClothe[0].correctiony * resizeHeight) : 0)
        + (sizes.height / printingClothe[0].coordinatey) - (resizeHeight / 2)
    );
    //
    // let coordinatey = Math.floor(Number(sizes.width / printingClothe[0].coordinatey));
    // let coordinatex = Math.floor(Number(sizes.height / printingClothe[0].coordinatex));

    if(file) {
        await uploadPhoto(ctx, file);
    } else {
        await uploadPhoto(ctx);
    }


    await sharp(ctx.session.printingProps.fi).resize(resizeWidth , resizeHeight, {fit: 'cover'}).toFile(ctx.session.printingProps.fo);

    // await sharp(inputPhoto).overlayWith(ctx.session.printingProps.fo, coordinatey, coordinatex).toFile(ctx.session.printingProps.outputPhoto)

    await sharp(inputPhoto).composite([{
        input: ctx.session.printingProps.fo,
        top: coordinatey,
        left: coordinatex,
    }]).toFormat('jpg').flatten({ background: { r: 255, g: 255, b: 255 }}).toFile(ctx.session.printingProps.outputPhoto)

    await ctx.replyWithPhoto({
        source: ctx.session.printingProps.outputPhoto,
        filename: `${ctx.from.id}_finale.png`
    }, Extra.markup(markup => {
        return markup.keyboard([
            [`${ctx.i18n.t('printingOrder')}`],
            [`${ctx.i18n.t('menuBack')}`],
            [`${ctx.i18n.t('menuMainBack')}`]
        ]).resize();
    }))
}