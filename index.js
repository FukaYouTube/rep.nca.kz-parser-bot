require('dotenv').config()

const Telegraf = require('telegraf')
const app = new Telegraf(process.env.BOT_TOKEN)

const stage = require('./source/stage')
const session = require('telegraf/session')
const { keyboard } = require('telegraf/markup')

const dataConfig = require('./data.config')
const { mainParser } = require('./source/module/main.parser')

// Telegraf middleware
app.use(session())
app.use(stage)

// Bot commands
app.start(ctx => ctx.replyWithMarkdown(
    `*Здравствуйте ${ctx.from.first_name || ctx.from.username}!* Вот главное меню:`,
    keyboard(dataConfig.MAIN_MENU).oneTime().resize().extra()
))

app.hears(/./gm, (ctx, next) => {
    ctx.session.selected_name = ctx.message.text

    switch(ctx.message.text){
        case dataConfig.MAIN_MENU[0][0]: // ['Сканировать "Сертификаты соответствия"']
            mainParser(ctx, dataConfig.DEFAULT_START_PAGE_1, 'end_page', { url1: process.env.URL_START_1, url2: process.env.URL_END_1 })
        break
        case dataConfig.MAIN_MENU[1][0]: // ['Сканировать "Декларации о соответствии"']
            mainParser(ctx, dataConfig.DEFAULT_START_PAGE_2, 'end_page', { url1: process.env.URL_START_2, url2: process.env.URL_END_2 })
        break
        case dataConfig.MAIN_MENU[2][0]: // ['Указать страницы самому от и до']
            ctx.scene.enter('CUSTOM_PAGE_SCENE')
        break
        case dataConfig.MAIN_MENU[3][0]: // ['Продолжить загрузку']
            ctx.reply(`Чтобы продолжить, выберите категорию:`, keyboard(dataConfig.SELECT_CATEGORY).oneTime().resize().extra())
        break
        case dataConfig.SELECT_CATEGORY[0][0]: // ['Сертификаты соответствия']
            mainParser(ctx, 0, 'proceed_page', { url1: process.env.URL_START_1, url2: process.env.URL_END_1 })
        break
        case dataConfig.SELECT_CATEGORY[1][0]: // ['Декларации о соответствии']
            mainParser(ctx, 0, 'proceed_page', { url1: process.env.URL_START_2, url2: process.env.URL_END_2 })
        break
        default:
            ctx.replyWithMarkdown(`*Ошибка* Данная команда "${ctx.message.text}" не найдена!`)
            next()
    }
})

app.startPolling()