require('dotenv').config()

const Telegraf = require('telegraf')
const app = new Telegraf(process.env.BOT_TOKEN)

const stage = require('./source/stage')
const session = require('telegraf/session')

const dataConfig = require('./data.config')
const { mainParser } = require('./source/module/main.parser')
const { sendMessage, sendMessageMarkup } = require('./source/module/send.message')

// Telegraf middleware
app.use(session())
app.use(stage)

// Bot commands
app.start(ctx => sendMessageMarkup(ctx, `*Здравствуйте ${ctx.from.first_name || ctx.from.username}!* Вот главное меню:`, dataConfig.MAIN_MENU))

app.hears(/./gm, (ctx, next) => {
    ctx.session.selected_name = ctx.message.text

    switch(ctx.message.text){
        case dataConfig.MAIN_MENU[0][0]: // ['Сканировать "Сертификаты соответствия"']
            mainParser(ctx, dataConfig.DEFAULT_START_PAGE_1, 'end_page', { url1: process.env.URL_START_1, url2: process.env.URL_END_1 }, -2)
        break
        case dataConfig.MAIN_MENU[1][0]: // ['Сканировать "Декларации о соответствии"']
            mainParser(ctx, dataConfig.DEFAULT_START_PAGE_2, 'end_page', { url1: process.env.URL_START_2, url2: process.env.URL_END_2 }, -3)
        break
        case dataConfig.MAIN_MENU[2][0]: // ['Указать страницы самому от и до']
            ctx.scene.enter('CUSTOM_PAGE_SCENE')
        break
        case dataConfig.MAIN_MENU[3][0]: // ['Продолжить загрузку']
            sendMessageMarkup(ctx, `Чтобы продолжить, выберите категорию:`, dataConfig.SELECT_CATEGORY)
        break
        case dataConfig.SELECT_CATEGORY[0][0]: // ['Сертификаты соответствия']
            if(!ctx.session.end_page) return sendMessageMarkup(ctx, 'Номера конец страницы на котором вы остановились не найдены!', dataConfig.MAIN_MENU)
            mainParser(ctx, ctx.session.end_page, 'proceed_page', { url1: process.env.URL_START_1, url2: process.env.URL_END_1 })
        break
        case dataConfig.SELECT_CATEGORY[1][0]: // ['Декларации о соответствии']
            if(!ctx.session.end_page) return sendMessageMarkup(ctx, 'Номера конец страницы на котором вы остановились не найдены!', dataConfig.MAIN_MENU)
            mainParser(ctx, ctx.session.end_page, 'proceed_page', { url1: process.env.URL_START_2, url2: process.env.URL_END_2 })
        break
        default:
            sendMessage(ctx, `*Ошибка* Данная команда "${ctx.message.text}" не найдена!`)
            next()
    }
})

app.startPolling()