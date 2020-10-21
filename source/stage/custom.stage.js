const Wizard = require('telegraf/scenes/wizard')

const dataConfig = require('../../data.config')

const { scanner } = require('../module/main.parser')
const { sendMessage, sendMessageMarkup, sendMessageRemoveMarkup } = require('../module/send.message')

const WizardScene = new Wizard('CUSTOM_PAGE_SCENE', ctx => {

    sendMessageMarkup(ctx, 'Выберите категорию:', dataConfig.SELECT_CATEGORY)
    return ctx.wizard.next()

}, ctx => {

    ctx.session.custom_number_page = []
    ctx.session.selected_name = ctx.message.text

    sendMessageRemoveMarkup(ctx, 'Укажите начало страницы:')
    return ctx.wizard.next()

}, ctx => {

    if(!Number(ctx.message.text)){
        sendMessageMarkup('Ошибка! Отправьте цифру. \nПовторите попытку', dataConfig.MAIN_MENU)
        return ctx.scene.leave()
    }

    ctx.session.custom_number_page.push(ctx.message.text)
    sendMessage(ctx, 'Укажите конец страницы:')
    return ctx.wizard.next()

}, ctx => {

    if(!Number(ctx.message.text)){
        sendMessageMarkup('Ошибка! Отправьте цифру. \nПовторите попытку', dataConfig.MAIN_MENU)
        return ctx.scene.leave()
    }

    switch(ctx.session.selected_name){
        case dataConfig.SELECT_CATEGORY[0][0]:
            scanner(ctx, Number(ctx.session.custom_number_page[0]), Number(ctx.message.text), { url1: process.env.URL_START_1, url2: process.env.URL_END_1 })
        break
        case dataConfig.SELECT_CATEGORY[1][0]:
            scanner(ctx, Number(ctx.session.custom_number_page[0]), Number(ctx.message.text), { url1: process.env.URL_START_2, url2: process.env.URL_END_2 })
        break
        default:
            sendMessageMarkup(ctx, 'Ошибка! Вами отправленная категория не найдена \nПовторите попытку', dataConfig.MAIN_MENU)
    }
    
    return ctx.scene.leave()
})

module.exports = WizardScene