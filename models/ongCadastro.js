const db = require('./db')

//Criando tabela de cadastro de ONG no banco de dados
const ongCadastro = db.sequelize.define('ongcadastros',{
    razaoSocial:{
        type:db.Sequelize.STRING
    },
    cnpj:{
        type:db.Sequelize.STRING
    },
    endereco:{
        type:db.Sequelize.STRING
    },
    numero:{
        type:db.Sequelize.STRING
    },
    bairro:{
        type:db.Sequelize.STRING
    },
   cidade:{
       type:db.Sequelize.STRING
   },
   estado:{
       type:db.Sequelize.STRING
   },
    email:{
        type:db.Sequelize.STRING
    },
    senha:{
        type:db.Sequelize.STRING
    },
    whatsapp:{
        type:db.Sequelize.STRING
    },
    telefoneFixo:{
        type:db.Sequelize.STRING
    },
    foto:{
        type:db.Sequelize.STRING
    },
    usuario:{
        type:db.Sequelize.STRING
    }
})


//Cria tabela - somente uma vez
//ongCadastro.sync({force:true})


//exportando a constante
module.exports= ongCadastro