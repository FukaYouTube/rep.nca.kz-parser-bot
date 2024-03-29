const axios = require('axios')
const cheerio = require('cheerio')

const dataConfig = require('../../data.config')
const excel = require('./save.excel')

const { sendMessage, sendMessageRemoveMarkup } = require('./send.message')

exports.mainParser = async (ctx, start, end, url, get_end_page) => {
    sendMessageRemoveMarkup(ctx, `Идет сканирование сайта, *ожидайте*! \nВыбрана из главного меню: "${ctx.session.selected_name}"`)

    try {
        const { data } = await axios.get(`${url.url1}1${url.url2}`)
        const $ = cheerio.load(data)
    
        const endPagesNumberInHTML = $('.text tr td').eq(get_end_page).html()
        const loadEndPages = cheerio.load(endPagesNumberInHTML)
        const endPagesNumber = loadEndPages('a').eq(-1).text()
    
        switch(end){
            case 'end_page':
                this.scanner(ctx, start, Number(endPagesNumber), url)
                ctx.session.end_page = Number(endPagesNumber)
            break
            case 'proceed_page':
                this.scanner(ctx, start, Number(endPagesNumber), url)
                ctx.session.end_page = Number(endPagesNumber)
            break
        }
    }catch(error){
        ctx.reply('Произошла ошибка: не удалось зайти на сайт \nПовторяю процесс')
        this.mainParser(ctx, start, end, url, get_end_page)
    }
}

exports.scanner = async (ctx, start, end, url) => {
    for(let i = start; i <= end; i++){
        if(dataConfig.EMAIL_ITEMS.length >= 3000){
            sendMessage(ctx, `Память переполнен! Отправляю файл \nПродолжу загрузку через несколько минут...`)
            excel.save(ctx, ctx.session.end_page)

            dataConfig.EMAIL_ITEMS = []
        }

        sendMessage(ctx, `Выполняется поиск, ожидайте... \nПерехожу по страницам сайта: ${i} из ${end}`)

        let nextPage
        try {
            nextPage = await axios.get(url.url1 + i + url.url2)
        } catch(error){
            console.log(error)
            nextPage = await axios.get(url.url1 + i + url.url2)
        }

        let selector = cheerio.load(nextPage.data)

        selector('.text tr td a').each((index, element) => {
            const emailRegex = /(?:[A-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g
            const values = selector(element).text()

            if(emailRegex.test(values)){
                dataConfig.EMAIL_ITEMS.push(values.match(emailRegex)[0])
            }
        })   
    }

    ctx.session.custom_number_page = []
    sendMessage(ctx, `Готово, ожидайте файл...`)
    excel.save(ctx)
}