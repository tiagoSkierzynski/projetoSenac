const Sequelize = require("sequelize")

const sequelize = new Sequelize('projetosenactiag', 'tiago123312123','Tiago2021',{
    host:'mysql743.umbler.com',
    dialect:'mysql'
})

module.exports = {
    Sequelize:Sequelize,
    sequelize:sequelize
}