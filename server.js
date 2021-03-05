const ongCadastro = require("./models/ongCadastro")

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

/*
 //configurações do multer
 const multer = require("multer")

 const storage = multer.diskStorage({
       destination:(req,file,cb) =>{cb(null,'public/imagens')},
       filename:(req,file,cb) => {cb(null,file.originalname)}
 })
 
 const upload = multer({storage})
*/

//configuração da session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

 /*Esta rota esta fazendo o login do site, ele vai até o banco de dados, conta quantos registros tem no BD, e se 
    for superior a um ele entra na sentença. Ele ve que há um dado igual aquele no banco.*/

    app.get('/login', function (req, res) {
        res.render("login");
    })
    
    app.post('/login1', function(req,res){
        req.session.nome = req.body.nome
        req.session.senha = req.body.senha
        
        ongCadastro.count({where: ({nome: req.session.nome}, {senha: req.session.senha})}).then(function(dados){
            if(dados >= 1){
                res.render('caminhos')
            }else{
                res.send("Usuário não encontrado" + dados)
            }
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
    app.get('/sair', function(req,res){
        req.session.destroy(function(){
            res.render('paginaInicial')
        })
    })

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


//esse bloco é disparado pelo enviar do formulario
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
app.get('/cadastroOng',function(req,res){
    if(req.session.email){

    ongCadastro.findAll().then(function(ongs){
        res.render('cadastroOng',{ong: ongs.map(cadastramento => cadastramento.toJSON())})
    })
}else{
    res.render('cadastroOng')
}
})

//criando nova rota para formulario de updateOng
app.get('/updateOng/:id',function(req,res){
    ongCadastro.findAll({ where:{'id':req.params.id}}).then(function(ongs){
            res.render('updateOng',{ong: ongs.map(cadastramento => cadastramento.toJSON())})
    })
})

//depois vamos criar essa rota que envia para o banco de dados e chama o  formulario de edição

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

//criando o delete ong
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

app.get('/paginaInicial',function(req,res){
    res.render("paginaInicial")
})

app.get("/quemSomos", function(req,res){
    res.render("quemSomos")
})

app.get("/doeAgora", function(req,res){
    res.render("doeAgora")
})

app.get("/login", function(req,res){
    res.render("login")
}),

//rota que está em "cadastro" no menu, que vai definir a qual caminho o usuário deve escolher
app.get("/caminhos", function(req,res){   
    res.render("caminhos")
})

app.get('/cadastroOng',function(req,res){
    ongCadastro.findAll().then(function(ongs){
        res.render('cadastroOng',{ong: ongs.map(cadastramento => cadastramento.toJSON())})
    })
})

app.get("/cadastrarProdutos", function(req,res){
    res.render("cadastrarProdutos")
})

app.get("/cadastrarAdministrador", function(req,res){
    res.render("cadastrarAdministrador")
})

app.get("/finalizarDoacao", function(req,res){
    res.render("finalizarDoacao")
})

app.listen(3000);
