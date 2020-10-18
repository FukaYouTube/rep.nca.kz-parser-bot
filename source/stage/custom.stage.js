const Wizard = require('telegraf/scenes/wizard')

const { keyboard, removeKeyboard } = require('telegraf/markup')

const dataConfig = require('../../data.config')

const { mainParser, scanner } = require('../module/main.parser')

const WizardScene = new Wizard('CUSTOM_PAGE_SCENE', ctx => {

    ctx.reply('Выберите категорию:', keyboard(dataConfig.SELECT_CATEGORY).oneTime().resize().extra())
    return ctx.wizard.next()

}, ctx => {

    ctx.session.custom_number_page = []
    ctx.session.selected_name = ctx.message.text

    ctx.reply('Укажите начало страницы:', removeKeyboard().oneTime().resize().extra())
    return ctx.wizard.next()

}, ctx => {

    if(!Number(ctx.message.text)){
        ctx.reply('Ошибка! Отправьте цифру. \nПовторите попытку', keyboard(dataConfig.MAIN_MENU).oneTime().resize().extra())
        return ctx.scene.leave()
    }

    ctx.session.custom_number_page.push(ctx.message.text)
    ctx.reply('Укажите конец страницы:')
    return ctx.wizard.next()

}, ctx => {

    if(!Number(ctx.message.text)){
        ctx.reply('Ошибка! Отправьте цифру. \nПовторите попытку', keyboard(dataConfig.MAIN_MENU).oneTime().resize().extra())
        return ctx.scene.leave()
    }

    switch(ctx.session.selected_name){
        case dataConfig.SELECT_CATEGORY[0][0]:
            scanner(ctx, Number(ctx.session.custom_number_page[0]), Number(ctx.message.text), { url1: process.env.URL_START_1, url2: process.env.URL_END_1 })
        break
        case dataConfig.SELECT_CATEGORY[0][1]:
            scanner(ctx, Number(ctx.session.custom_number_page[0]), Number(ctx.message.text), { url1: process.env.URL_START_2, url2: process.env.URL_END_2 })
        break
        default:
            ctx.reply('Ошибка! Вами отправленная категория не найдена \nПовторите попытку', keyboard(dataConfig.MAIN_MENU).oneTime().resize().extra())
    }

    return ctx.scene.leave()
})

module.exports = WizardScene