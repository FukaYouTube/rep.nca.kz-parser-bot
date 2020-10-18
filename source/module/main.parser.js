const axios = require('axios')
const cheerio = require('cheerio')

const { removeKeyboard } = require('telegraf/markup')

const dataConfig = require('../../data.config')
const excel = require('./save.excel')

exports.mainParser = async (ctx, start, end, url) => {
    ctx.replyWithMarkdown(`Идет сканирование сайта, *ожидайте*! \nВыбрана из главного меню: "${ctx.session.selected_name}"`, removeKeyboard().oneTime().resize().extra())

    const { data } = await axios.get(url.url1 + start + url.url2)
    const $ = cheerio.load(data)

    const endPagesNumberInHTML = $('.text tr td').eq(-2).html()
    const loadEndPages = cheerio.load(endPagesNumberInHTML)
    const endPagesNumber = loadEndPages('a').eq(-1).text()

    switch(end){
        case 'end_page':
            this.scanner(ctx, start, Number(endPagesNumber), url)
            ctx.session.end_page = Number(endPagesNumber)
        break
        case 'proceed_page':
            this.scanner(ctx, ctx.session.end_page, Number(endPagesNumber), url)
            ctx.session.end_page = Number(endPagesNumber)
        break
    }
}

exports.scanner = async (ctx, start, end, url) => {
    for(let i = start; i <= end; i++){
        ctx.reply(`Выполняется поиск, ожидайте... \nПерехожу по страницам сайта: ${i} из ${end}`)

        let nextPage = await axios.get(url.url1 + i + url.url2)
        let selector = cheerio.load(nextPage.data)

        selector('.text tr td a').each((index, element) => {
            const values = selector(element).text()
            dataConfig.DATA_ITEMS.push({ values })
        })

        dataConfig.DATA_ITEMS.splice(0, 1)
        this.findEmail(dataConfig.DATA_ITEMS)
    }

    ctx.reply(`Готово! Отправляю excel файл...`)
    excel.save(ctx, dataConfig.EMAIL_ITEMS)

    dataConfig.DATA_ITEMS = []
    dataConfig.EMAIL_ITEMS = []
}

exports.findEmail = data => {
    let email = /(?:[A-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g

    data.forEach((d, i) => {
        if(email.test(d.values)){
            dataConfig.EMAIL_ITEMS.push({ id: i, email: d.values.match(email)[0], date: new Date() })
        }  
    })
}