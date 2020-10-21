const { keyboard, removeKeyboard } = require('telegraf/markup')

exports.sendMessage = (ctx, message) => {
    try{
        ctx.replyWithMarkdown(message)
    }catch(error){
        console.log(error)
    }
}

exports.sendMessageMarkup = (ctx, message, keyboards) => {
    try{
        ctx.replyWithMarkdown(message, keyboard(keyboards).oneTime().resize().extra())
    }catch(error){
        console.log(error)
    }
}

exports.sendMessageRemoveMarkup = (ctx, message) => {
    try{
        ctx.replyWithMarkdown(message, removeKeyboard().oneTime().resize().extra())
    }catch(error){
        console.log(error)
    }
}

exports.sendDocument = (ctx, path) => {
    try{
        ctx.replyWithDocument({ source: path })
    }catch(error){
        console.log(error)
    }
}

exports.sendDocumentMarkup = (ctx, path, keyboards) => {
    try{
        ctx.replyWithDocument({ source: path }, keyboard(keyboards).oneTime().resize().extra())
    }catch(error){
        console.log(error)
    }
}