const Stage = require('telegraf/stage')
const stage = new Stage()

stage.register(require('./custom.stage'))

module.exports = stage