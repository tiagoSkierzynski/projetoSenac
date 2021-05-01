const db = require('./db')

//Criando tabela de cadastro de ONG no banco de dados
const fale_conosco = db.sequelize.define('fale_conosco',{
   nome_solicitante:{
       type:db.Sequelize.STRING
    },
    email_solicitante:{
    type:db.Sequelize.STRING
    },
    relato_solicitante:{
    type:db.Sequelize.STRING
    }
})


//Cria tabela - somente uma vez
//fale_conosco.sync({force:true})


//exportando a constante
module.exports = fale_conosco

