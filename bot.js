require('dotenv').config()
const {Telegraf} = require('telegraf');
const path = require('path');
const I18n = require('telegraf-i18n');
const MySQLSession = require('telegraf-session-mysql');
const Stage = require('telegraf/stage');
const adminApp = require('./admin panel/admin');

const Question = require('./src/models/Questions');

const i18n = new I18n({
    directory: path.resolve(__dirname, 'locales'),
    defaultLanguage: 'ru',
    sessionName: 'session',
    useSession: true
})

const session = new MySQLSession({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_BASE
})


const bot = new Telegraf(process.env.TGTOKEN)

// Scenes
const languageScene = require('./src/scenes/language')();

const mainScene = require('./src/scenes/main')(bot, I18n);
const aboutScene = require('./src/scenes/about')(bot);
const catalogueScene = require('./src/scenes/catalogue');
const askQuestionScene = require('./src/scenes/askQuestion')(bot, I18n);
const catalogueEnterScene = catalogueScene.catalogueEnterScene(bot, I18n);
const catalogueVariationScene = catalogueScene.catalogueVariationScene(bot, I18n);
const catalogueMaterialScene = catalogueScene.catalogueMaterialScene(bot, I18n);
const catalogueSizeScene = catalogueScene.catalogueSizeScene(bot, I18n);
const catalogueQuantityScene = catalogueScene.catalogueQuantityScene(bot, I18n);
const catalogueSceneMultipleQuantity = catalogueScene.catalogueSceneMultipleQuantity(bot, I18n);
const catalogueContactNameScene = catalogueScene.catalogueContactNameScene(bot, I18n);
const catalogueContactPhoneScene = catalogueScene.catalogueContactPhoneScene(bot, I18n)
const catalogueEndScene = catalogueScene.catalogueEndScene(bot, I18n);
const catalogueContactLocationScene = catalogueScene.catalogueContactLocationScene(bot, I18n);
const printingScene = require('./src/scenes/printing');
const printingSceneEnter = printingScene.printingSceneEnter(bot, I18n);
const printingSizeScene = printingScene.printingSizeScene(bot, I18n);
const printingSceneQuantity = printingScene.printingSceneQuantity(bot, I18n);
const printingSceneMultipleQuantity = printingScene.printingSceneMultipleQuantity(bot, I18n);
const printingContactNameScene = printingScene.printingContactNameScene(bot, I18n);
const printingContactPhoneScene = printingScene.printingContactPhoneScene(bot, I18n);
const printingContactLocationScene = printingScene.printingContactLocationScene(bot, I18n);
const printingEndScene = printingScene.printingEndScene(bot, I18n);
const printingSceneClothe = printingScene.printingSceneClothe(bot, I18n);
const printingStyleScene = printingScene.printingStyleScene(bot, I18n);


const stgs = [printingContactLocationScene, catalogueSizeScene, printingStyleScene, catalogueContactLocationScene,
    catalogueSceneMultipleQuantity, printingSceneMultipleQuantity, printingSceneClothe,
    printingSizeScene, printingContactNameScene, printingContactPhoneScene, printingEndScene,
    printingSceneEnter, printingSceneQuantity, catalogueEnterScene, catalogueMaterialScene,
    catalogueQuantityScene, catalogueVariationScene, languageScene, mainScene, aboutScene,
    catalogueContactNameScene, catalogueContactPhoneScene, askQuestionScene, catalogueEndScene];

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


bot.start(ctx => {
    ctx.session.mesage_filter = [];
    return ctx.scene.enter('language');
})

bot.use(async ctx => {
    //  -1001323833574 orders
    //  -1001450276522 qa

    // return ctx.scene.enter('language');

    if (ctx.update.message) {
        if (ctx.update.message.chat.id === -1001450276522 && ctx.update.message.reply_to_message) {
            // console.log(ctx.update.message.text);
            // console.log(ctx.update.message.reply_to_message);
            const qstn = await Question.findOne({
                where:
                    {message_id: ctx.update.message.reply_to_message.message_id}
            })

            qstn.answer = ctx.update.message.text;
            qstn.answered = ctx.update.message.from.username;
            qstn.message_status = 'Отвечено';
            await qstn.save();

            const sendMarkup = `
<b>Здравствуйте ответ на ваш вопрос</b>
<i>${qstn.question}</i>\n
${qstn.answer}
`

            bot.telegram.sendMessage(qstn.user_id, sendMarkup, {
                parse_mode: "HTML",
            });

            bot.telegram.editMessageReplyMarkup('-1001450276522', qstn.message_id, '',
                {
                    reply_markup: {
                        inline_keyboard: [[{
                            text: `${qstn.message_status}`,
                            callback_data: `${qstn.message_status}`
                        }]]
                    }
                })
        }
    }
})



bot.startPolling()
adminApp.listen(3000, () => console.log('AdminBro is under localhost:3000/admin'))
