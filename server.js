const usuario = require("./models/usuario")

const express = require("express")
const app = express()

const handlebars = require("express-handlebars")
const bodyParser = require("body-parser")

app.engine('handlebars',handlebars({defaultLayout:'main'}))
app.set('view engine','handlebars')

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

app.use('/static', express .static(__dirname + '/public'));

//chamada ao módulo express-session
var session = require('express-session'); 

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
        
        usuario.count({where: ({nome: req.session.nome}, {senha: req.session.senha})}).then(function(dados){
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

    app.get('/sair', function(req,res){
        req.session.destroy(function(){
            res.render('paginaInicial')
        })
        //Aqui destrói a sessão criada após fazer login.
    })

app.post('/delete',function(req,res){
    usuario.destroy({
        where:{'id': req.body.id}
    }).then(function(){
        usuario.findAll().then(function(doadores){
            res.render('cadastro',{doador: doadores.map(
                pagamento => pagamento.toJSON())})
        })

        .catch(function(){ res.send("não deu certo")
        })
    })
});

//VAMOS CRIAR MAIS UMA ROTA E ELA DARA PARA UM FORMULÁRIO
app.get('/update/:id',function(req,res){
    usuario.findAll({ where:{'id' : req.params.id}}).then(function(doadores){
        res.render('atualiza',{doador: doadores.map(pagamento => pagamento.toJSON())})
    })
})

app.get('/cadastro',function(req,res){
    usuario.findAll().then(function(doadores){
        res.render("cadastro",{doador: doadores.map(pagamento => pagamento.toJSON())})
    })
})


//esse bloco é disparado pelo enviar do formulario
app.post('/cadUsuario',upload.single('foto'),function(req,res){
    console.log(req.file.originalname);
    usuario.create({
        nomeCompleto:req.body.nomeCompleto,
        senha:req.body.senha,
        cpf_cnpj:req.body.cpf_cnpj,
        telefone:req.body.telefone,
        tipo:req.body.tipo,
        email:req.body.email,
        endereco:req.body.endereco,
        estado:req.body.estado,
        cidade:req.body.cidade,
        cep:req.body.cep,
        foto:req.file.originalname,
        descricao:req.body.descricao
    }).then(function(){
        usuario.findAll().then(function(doadores){
            res.render('cadastro',{doador: doadores.map(pagamento => pagamento.toJSON())})
        })
    }).catch(function(erro){
        res.send("Erro "+erro)
    })
})

app.get('/paginaInicial',function(req,res){
    res.render("paginaInicial")
})

app.get("/cadastrarAdministrador", function(req,res){
    res.render("cadastrarAdministrador")
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

app.get("/caminhoAtualiza", function(req,res){
    res.render("caminhoAtualiza")
}),

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

app.get("/cadastro", function(req,res){
    res.render("cadastro")
})

app.get("/pessoa", function(req,res){
    res.render("pessoa")
})

app.get("/cadastrarProdutos", function(req,res){
    res.render("cadastrarProdutos")
})

app.get("/finalizarDoacao", function(req,res){
    res.render("finalizarDoacao")
})

//DEPOIS VAMOS CRIAR ESSA ROTA QUE ENVIA PARA O BANCO E DEPOIS CHAMA O FORMULARIO
app.post('/updateUsuario',function(req,res){
    usuario.update({nome:req.body.nome,senha:req.body.senha },{
        where:{id:req.body.codigo}}
    ).then(function(){
        usuario.findAll().then(function(doadores){
            res.render('formulario',{doador: doadores.map(pagamento => pagamento.toJSON())})
    })
    }).catch(function(erro){
        res.send("Erro "+erro)
    })
})

app.listen(3000);
