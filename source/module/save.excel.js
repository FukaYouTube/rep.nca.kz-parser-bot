const csv = require('fast-csv')

const { keyboard } = require('telegraf/markup')

const dataConfig = require('../../data.config')

exports.save = (ctx, data) => {
    const path_file = `source/upload/${ctx.from.id}_${ctx.session.selected_name}.csv`

    try {
        csv.writeToPath(path_file, data, { headers: true, quoteColumns: true })
    }catch(err){
        console.log(err)
    }

    ctx.replyWithDocument({ source: path_file }, keyboard(dataConfig.MAIN_MENU).oneTime().resize().extra())
}