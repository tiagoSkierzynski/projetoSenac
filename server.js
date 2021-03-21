//CHAMADAS
const ongCadastro = require("./models/ongCadastro");
const doacaoCadastro = require("./models/doacao");

const express = require("express")
const app = express()

const handlebars = require("express-handlebars")
const bodyParser = require("body-parser")

app.engine('handlebars',handlebars({defaultLayout:'main'}))
app.set('view engine','handlebars')

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

app.use('/public', express .static(__dirname + '/public'));

//chamada ao módulo express-session
var session = require('express-session'); 

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

 /*Esta rota esta fazendo o login do site, ele vai até o banco de dados, conta quantos registros tem no bd, e se 
    for superior a um ele entra na sentença. Ele ve que há um dado igual aquele no banco.*/
    //essa rota do tipo get /login está sendo executada por um link que está em login.handlebars
    app.get('/login', function (req, res) {
        res.render("login");
    })

    //criando a rota da session para verificar a tabela correta
    
    //todas as rotas que são do tipo "post" são executadas pelo formulário
    //a rota /login vem do formulário chamado login.handlebars
    app.post('/login', function(req,res){                    
    //    req.session.email = req.body.email
    //    req.session.senha = req.body.senha
    
       ongCadastro.count({where: ({email: req.body.email}, {senha: req.body.senha})}).then(function(dados){
          if(dados >= 1){
              res.render('cadastroDoacao')
              req.session.email = req.body.email
              req.session.senha = req.body.senha
            }else{
              res.send("Usuário não encontrado no momento")
          }
       }).catch(function(erro){
        res.send("deu tudo errado")
    })
    })

 /*   
    //código responsável pela validação do email, com o servidor smtp ele vai ser responsável pela validação da conta dos usuários pelo email
    const nodemailer = require("nodemailer")

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: "tiagosala44@gmail.com",
            pass: "salatiago44"
        },
        tls: { rejectUnauthorized: false }
    });

    const mailOptions = {
        from: 'tiagosala44@gmail.com',
        to: 'tiagoskierzynski@gmail.com',
        subject: 'E-mail enviado usando Node!',
        text: 'Bem fácil, não? ;)'
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email enviado: ' + info.response);
        }
    });
    */
    
    //este código configura o multer para fazer upload de imagens
    const multer = require("multer")

    const storage = multer.diskStorage({
        destination:(req,file,cb) =>{cb(null,'public/img1')},
        filename:(req,file,cb) => {cb(null,file.originalname)}
    })

    const upload = multer({storage})

    //Aqui destrói a sessão criada após fazer login.
    //todas as rotas do tipo "get" costumam ser executadas por links
        //essa rota do tipo get /sair está sendo executada por um link que está em main.handlebars
    app.get('/sair', function(req,res){
        req.session.destroy(function(){
            res.render('paginaInicial')
        })
    })

    //a rota /delete vem do formulário chamado cadastroOng.handlebars
app.post('/delete',function(req,res){
    ongCadastro.destroy({
        where:{'id': req.body.id}
    }).then(function(){
        ongCadastro.findAll().then(function(doadores){
            res.render('cadastro',{doador: doadores.map(
                pagamento => pagamento.toJSON())})
        })

        .catch(function(){ res.send("não deu certo")
        })
    })
});

//COMEÇANDO AS CONFIGURAÇÕES DE CADASTRO DE ONG
//esse bloco é disparado pelo enviar do formulario
//a rota /cadOng vem do formulário chamado cadastroOng.handlebars
app.post('/cadOng', upload.single('imagem_prod'),function(req,res){
    console.log(req.file.originalname)
    ongCadastro.create({
        razaoSocial:req.body.razaoSocial,
        cnpj:req.body.cnpj,
        endereco:req.body.endereco,
        numero:req.body.numero,
        bairro:req.body.bairro,
        cidade:req.body.cidade,
        estado:req.body.estado,
        email:req.body.email,
        senha:req.body.senha,
        whatsapp:req.body.whatsapp,
        telefoneFixo:req.body.telefoneFixo,
        foto:req.file.originalname
    }).then(function(){
        ongCadastro.findAll().then(function(ongs){
            res.render('cadastroOng',{ong: ongs.map(cadastramento => cadastramento.toJSON())})
    })
    }).catch(function(erro){
        res.send("Erro"+erro)
    })
})

//este bloco e disparado pela url do navegador e buscar o cadastroOng
    //essa rota do tipo get /cadastroOng está sendo executada por um link que está em main.handlebars
app.get('/cadastroOng',function(req,res){
    if(req.session.email){

    ongCadastro.findAll().then(function(ongs){
        res.render('cadastroOng',{ong: ongs.map(cadastramento => cadastramento.toJSON())})
    })
}else{
    res.render('cadastroOng')
}
})

//depois vamos criar essa rota que envia para o banco de dados e chama o  formulario de edição
    //a rota /updateOng vem do formulário chamado updateOng.handlebars
app.post('/updateOng',function(req,res){
    ongCadastro.update({
        razaoSocial:req.body.razaoSocial,
        cnpj:req.body.cnpj,
        endereco:req.body.endereco,
        numero:req.body.numero,
        bairro:req.body.bairro,
        cidade:req.body.cidade,
        estado:req.body.estado,
        email:req.body.email,
        senha:req.body.senha,
        whatsapp:req.body.whatsapp,
        telefoneFixo:req.body.telefoneFixo,
},{
            where:{id:req.body.id}}
    ).then(function(){
        ongCadastro.findAll().then(function(ongs){
            res.render('cadastroOng',{ong: ongs.map(cadastramento => cadastramento.toJSON())})
    })
    }).catch(function(erro){
        res.send("Erro"+erro)
    })
})
/*
//código que mostra somente os dados da ong que iniciou sua sessão
app.post('/cadastroOng',function(req,res){
    ongCadastro.findAll({
        where:{'id': req.body.id}
    }).then(function(){
        ongCadastro.findAll().then(function(ongs){
            res.render('cadastroOng',{ong: ongs.map(
                cadastramento => cadastramento.toJSON())})
        })
*/
//criando o delete ong
    //a rota /deleteOng vem do formulário chamado cadastroOng.handlebars
    app.post('/deleteOng',function(req,res){
        ongCadastro.destroy({
            where:{'id': req.body.id}
        }).then(function(){
            ongCadastro.findAll().then(function(ongs){
                res.render('cadastroOng',{ong: ongs.map(
                    cadastramento => cadastramento.toJSON())})
            })
    
          .catch(function(){res.send("não deu certo")
            })
        })
    })
//TÉRMINO DO CADASTRO DE ONG


//COMEÇANDO AS CONFIGURAÇÕES DE CADASTRO DE DOAÇÕES
//criando tabela de doação
    //a rota /cadDoacao vem do formulário chamado cadastroDoacao.handlebars
app.post('/cadDoacao',function(req,res){
   
    doacaoCadastro.create({
        categoria:req.body.categoria,
        descricao:req.body.descricao,
        nivel:req.body.nivel,
        idOng:req.body.idOng,

    }).then(function(){
        ongCadastro.findAll({where:{'id': req.body.idOng}}).then(function(doacoes){
            res.render('cadastroDoacao',{doacao: doacoes.map(cadastradoacao => cadastradoacao.toJSON())})
        }).catch(function(erro){
        res.send("Erro"+erro)
    })
})
})

//depois vamos criar essa rota que envia para o banco de dados e chama o  formulario de edição de doacao
    //a rota /updateDoacao vem do formulário chamado updateDoacao.handlebars
app.post('/updateDoacao',function(req,res){
    doacaoCadastro.update({
        
        
        categoria:req.body.categoria,
        descricao:req.body.descricao,
        nivel:req.body.nivel},{
            where:{id:req.body.id}}
    ).then(function(){
        doacaoCadastro.findAll().then(function(doacoes){
            res.render('cadastroDoacao',{doacao: doacoes.map(cadastradoacao => cadastradoacao.toJSON())})
    })
    }).catch(function(erro){
        res.send("Erro"+erro)
    })
})

//criando o delete doacao
    //a rota /deleteDoacao vem do formulário chamado deleteDoacao.handlebars
app.post('/deleteDoacao',function(req,res){
    doacaoCadastro.destroy({
        where:{'id': req.body.id}
    }).then(function(){
        doacaoCadastro.findAll().then(function(doacoes){
            res.render('cadastroDoacao',{doacao: doacoes.map(
                cadastradoacao => cadastradoacao.toJSON())})
        })

      .catch(function(){res.send("Não deu certo")
        })
    })
})

//TERMINANDO TODAS CONFIGURAÇÕES DE DOAÇÃO

//CRIANDO NOVA ROTA PARA ACESSAR O PERFIL DA ONG
    //a rota /perfilOng vem do formulário chamado perfilOng.handlebars
app.post('/perfilOng',function(req,res){
    ongCadastro.findAll({ where:{'id':req.params.id}}).then(function(ongs){
            res.render('perfilOng',{ong: ongs.map(cadastramento => cadastramento.toJSON())})
    })
})
    //essa rota do tipo get /perfilOng está sendo executada por um link que está em doeAgora.handlebars
app.get('/perfilOng',function(req,res){
    res.render('perfilOng')
})

    //essa rota do tipo get /listaOng está sendo executada por um link que está em ???????
app.get('/listaOng',function(req,res){
    res.render('listaOng')
})
    //a rota /listaOng vem do formulário chamado ???????
app.post('/listaOng',function(req,res){
    ongCadastro.findAll().then(function(ongs){
            res.render('listaOng',{ong: ongs.map(cadastramento => cadastramento.toJSON())})
    })
})


/*         login antigo, comparando a estrutura com duas variaveis chumbadas
app.post('/login',function(req,res){
    req.session.nome = 'tiago';
    req.session.senha = 'tiago123';

    if(req.session.nome == req.body.nome  && req.body.senha == 'tiago123'){
        res.send("usuario logado")
    }else{
        res.send("usuario não existe")
    }
})*/
    //essa rota do tipo get /paginaInicial está sendo executada por um link que está em main.handlebars
app.get('/paginaInicial',function(req,res){
    res.render("paginaInicial")
})
    //essa rota do tipo get /quemSomos está sendo executada por um link que está em main.handlebars
app.get("/quemSomos", function(req,res){
    res.render("quemSomos")
})
    //essa rota do tipo get /doeAgora está sendo executada por um link que está em main.handlebars
app.get("/doeAgora", function(req,res){
    res.render("doeAgora")
})

//rota que está em "cadastro" no menu, que vai definir a qual caminho o usuário deve escolher
//essa rota está parada no momento
app.get("/caminhos", function(req,res){   
    res.render("caminhos")
})

//rota para formulario de cadastroOng
    //essa rota do tipo get /cadastroOng está sendo executada por um link que está em main.handlebars
app.get('/cadastroOng',function(req,res){
    if(req.session.email){    
    ongCadastro.findAll().then(function(ongs){
        res.render('cadastroOng',{ong: ongs.map(cadastramento => cadastramento.toJSON())})
    })
}else{
    res.render('cadastroOng')
}    
})

//rota para formulario de updateOng
    //essa rota do tipo get /updateOng está sendo executada por um link que está em cadastroOng.handlebars
app.get('/updateOng/:id',function(req,res){
    ongCadastro.findAll({ where:{'id':req.params.id}}).then(function(ongs){
            res.render('updateOng',{ong: ongs.map(cadastramento => cadastramento.toJSON())})
    })
})

//rota para formulario de cadastroDoacao
    //essa rota do tipo get /cadastroDoacao está sendo executada por um link que está em ???????
app.get('/cadastroDoacao',function(req,res){
    doacaoCadastro.findAll().then(function(doacoes){
        res.render('cadastroDoacao',{doacao: doacoes.map(cadastradoacao => cadastradoacao.toJSON())})
    })
})

//rota para formulario de updateDoacao
    //essa rota do tipo get /updateDoacao está sendo executada por um link que está em cadastroDoacao.handlebars
app.get('/updateDoacao/:id',function(req,res){
    doacaoCadastro.findAll({ where:{'id':req.params.id}}).then(function(doacoes){
            res.render('updateDoacao',{doacao: doacoes.map(cadastradoacao => cadastradoacao.toJSON())})
    })
})

    //essa rota do tipo get /cadastrarAdministrador está parada no momento
app.get("/cadastrarAdministrador", function(req,res){
    res.render("cadastrarAdministrador")
})

    //essa rota do tipo get /finalizarDoacao está parada no momento
app.get("/finalizarDoacao", function(req,res){
    res.render("finalizarDoacao")
})

app.listen(3000);
