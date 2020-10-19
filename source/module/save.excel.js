const fs = require('fs')

const ExcelJS = require('exceljs')
const excel = new ExcelJS.Workbook()

const { keyboard } = require('telegraf/markup')

const dataConfig = require('../../data.config')

exports.save = async (ctx, end_page) => {
    if(dataConfig.EMAIL_ITEMS.length === 0) return ctx.reply(`При сканировании электронные почты не были найдены`, keyboard(dataConfig.MAIN_MENU).oneTime().resize().extra())

    const path_file = `source/upload/${ctx.from.id}_${ctx.session.selected_name}_${end_page || 0}.xlsx`
    if(fs.existsSync(path_file)) fs.unlinkSync(path_file)

    try {
        const workheet = excel.addWorksheet('Email')

        workheet.columns = [{ header: 'Электронные почты', key: 'email', width: 50 }]
        dataConfig.EMAIL_ITEMS.forEach(email => workheet.addRow({ email }))
        workheet.getRow(1).eachCell(cell => cell.font = { bold: true })
    }catch(err){
        excel.removeWorksheet('Email')
        const workheet = excel.addWorksheet('Email')

        workheet.columns = [{ header: 'Электронные почты', key: 'email', width: 50 }]
        dataConfig.EMAIL_ITEMS.forEach(email => workheet.addRow({ email }))
        workheet.getRow(1).eachCell(cell => cell.font = { bold: true })
    }

    await excel.xlsx.writeFile(path_file)
    
    end_page ? 
    ctx.replyWithDocument({ source: path_file }) :
    ctx.replyWithDocument({ source: path_file }, keyboard(dataConfig.MAIN_MENU).oneTime().resize().extra())
}