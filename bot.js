require('dotenv').config()
const {Telegraf} = require('telegraf');
const path = require('path');
const I18n = require('telegraf-i18n');
const MySQLSession = require('telegraf-session-mysql');
const Stage = require('telegraf/stage');

const Question = require('./src/models/Questions');
const User = require('./src/models/User');

const i18n = new I18n({
    directory: path.resolve(__dirname, 'locales'),
    defaultLanguage: 'ru',
    sessionName: 'session',
    useSession: true
})

const session = new MySQLSession({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DBNAME
})


const bot = new Telegraf(process.env.TGTOKEN)

// Scenes
const languageScene = require('./src/scenes/language')();

const mainScene = require('./src/scenes/main')(bot, I18n);
const aboutScene = require('./src/scenes/about')(bot);
const catalogueScene = require('./src/scenes/catalogue');
const orderScene = require('./src/scenes/Order');
const askQuestionScene = require('./src/scenes/askQuestion')(bot, I18n);
const cartScene = require('./src/scenes/cart')(bot, I18n);
const catalogueEnterScene = catalogueScene.catalogueEnterScene(bot, I18n);
const catalogueVariationScene = catalogueScene.catalogueVariationScene(bot, I18n);
const catalogueSizeScene = catalogueScene.catalogueSizeScene(bot, I18n);
const catalogueQuantityScene = catalogueScene.catalogueQuantityScene(bot, I18n);
const catalogueSceneMultipleQuantity = catalogueScene.catalogueSceneMultipleQuantity(bot, I18n);
const catalogueAddToCartScene = catalogueScene.catalogueAddToCartScene(bot, I18n);
const orderEnterScene = orderScene.orderEnterScene(bot, I18n);
const orderContactNameScene = orderScene.orderContactNameScene(bot, I18n);
const orderContactPhoneScene = orderScene.orderContactPhoneScene(bot, I18n)
const orderEndScene = orderScene.orderEndScene(bot, I18n);
const orderContactLocationScene = orderScene.orderContactLocationScene(bot, I18n);
const printingScene = require('./src/scenes/printing');
const printingSceneEnter = printingScene.printingSceneEnter(bot, I18n);
const printingSceneClotheColor = printingScene.printingSceneClotheColor(bot, I18n);
const printingSizeScene = printingScene.printingSizeScene(bot, I18n);
const printingSceneClotheShape = printingScene.printingSceneClotheShape(bot, I18n);
const printingSceneQuantity = printingScene.printingSceneQuantity(bot, I18n);
const printingSceneMultipleQuantity = printingScene.printingSceneMultipleQuantity(bot, I18n);
const printingContactNameScene = printingScene.printingContactNameScene(bot, I18n);
const printingContactPhoneScene = printingScene.printingContactPhoneScene(bot, I18n);
const printingContactLocationScene = printingScene.printingContactLocationScene(bot, I18n);
const printingEndScene = printingScene.printingEndScene(bot, I18n);
const printingSceneClothe = printingScene.printingSceneClothe(bot, I18n);
const printingStyleScene = printingScene.printingStyleScene(bot, I18n);


const stgs = [cartScene, catalogueAddToCartScene, printingContactLocationScene, catalogueSizeScene, printingStyleScene,
    catalogueSceneMultipleQuantity, printingSceneMultipleQuantity, printingSceneClothe,
    printingSizeScene, printingContactNameScene, printingContactPhoneScene, printingEndScene,
    printingSceneEnter, printingSceneQuantity, catalogueEnterScene, printingSceneClotheShape,
    catalogueQuantityScene, catalogueVariationScene, languageScene, printingSceneClotheColor, mainScene, aboutScene, askQuestionScene, orderEnterScene,
    orderContactNameScene, orderContactPhoneScene, orderEndScene, orderContactLocationScene];

// Stage
const stage = new Stage();
let queue = new Map()
stage.use((ctx, next) => {
    if (ctx.message && ctx.message.photo) return next()
    let user = queue.get(ctx.from.id)
    if (user) return
    queue.set(ctx.from.id, true)
    return next().then(() => {
        queue.delete(ctx.from.id)
    }).catch(e => {
        console.error(e)
        queue.delete(ctx.from.id)
    })
})

// middlewares
bot.use(session.middleware())
bot.use(i18n.middleware())


stgs.map(stg => {
    stage.register(stg);
})

bot.use(stage.middleware());


bot.start( async ctx => {
    ctx.session.mesage_filter = [];

    const user = await User.findOne({where: {user_id: ctx.from.id}});


    if(!user){
        ctx.session.catalogueCart = [];
        ctx.session.cart = {};
        ctx.session.cart.totalPrice = 0;

        User.create({
            user_id: ctx.message.from.id,
            username: ctx.message.from.username,
            lastName: ctx.message.from.last_name,
            firstName: ctx.message.from.first_name,
        })

        return ctx.scene.enter('language');
    } else if (!user.chosenLanguage) {
        ctx.session.catalogueCart = [];
        ctx.session.cart = {};
        ctx.session.cart.totalPrice = 0;
        return ctx.scene.enter('language');
    }

    return ctx.scene.enter('mainMenu', {
        start: ctx.i18n.t('mainMenu')
    })

})


bot.use(async ctx => {
    //  -1001323833574 orders
    //  -1001450276522 qa

    // return ctx.scene.enter('language');

    if (ctx.update.message) {
        if (ctx.update.message.chat.id === -1001450276522 && ctx.update.message.reply_to_message) {

            const qstn = await Question.findOne({
                where:
                    {message_id: ctx.update.message.reply_to_message.message_id}
            })

            if (!qstn.answer) {

                qstn.answer = ctx.update.message.text;
                qstn.answered = ctx.update.message.from.username;
                qstn.message_status = `${ctx.i18n.t('askQuestionDone')}: ${qstn.answered}`;

                await qstn.save();

                const sendMarkup = `
<b>${ctx.i18n.t('askQuestionUserMessage')}</b>
<i>${qstn.question}</i>\n
${qstn.answer}
`

                bot.telegram.sendMessage(qstn.user_id, sendMarkup, {
                    parse_mode: "HTML",
                });

                bot.telegram.editMessageReplyMarkup('-1001450276522', qstn.message_id, null,
                    {
                        inline_keyboard: [[{
                            text: `${qstn.message_status}`,
                            callback_data: `${qstn.message_status}`
                        }]]

                    })
            }
        }
    }
})


bot.startPolling()
