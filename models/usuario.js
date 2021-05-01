const db = require('./db')

const usuario = db.sequelize.define('usuario',{
    usuario:{
        type:db.Sequelize.STRING
    },
    senha:{
        type:db.Sequelize.STRING
    },
    foto:{
        type:db.Sequelize.STRING
    },
    Pessoaid:{
        type:db.Sequelize.STRING
    }
})

//Cria tabela - somente uma vez
//usuario.sync({force:true})

//exportando a constante
module.exports= usuario