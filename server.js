//CHAMADAS
//Configuração para manipular arquivos vindos do formulário
const ongCadastro = require("./models/ongCadastro");
const doacaoCadastro = require("./models/doacao");
const usuario = require("./models/usuario")
const pessoa = require("./models/pessoa")
const fale_conosco = require("./models/fale_conosco")
const doacao = require("./models/doacao")
usuario.belongsTo(pessoa,{foreignkey:'Pessoaid',allowNull:true})

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


//Enviar email
const notificar = require("./controler/notificar")


    //este código configura o multer para fazer upload de imagens
    const multer = require("multer");
    const { type } = require("jquery");

    
    const storage = multer.diskStorage({
        destination:(req,file,cb) =>{cb(null,'public/img1')},
        filename:(req,file,cb) => {cb(null,file.originalname)}
    })

//ROTA PRINCIPAL
app.get('/',function(req,res){
    if(req.session.cpf != undefined){
        pessoa.findAll({where:{cpf:req.session.cpf}}).then(function(pessoas){
            res.render('paginaInicial',{pessoa: pessoas.map(pagamento => pagamento.toJSON())})
        })
    }else{
        res.render("paginaInicial")
    }
})
//FIM DA ROTA PRINCIPAL

app.get('/novo',function(req,res){
    if(req.session.idusuario != undefined){//o segurança...:)
    res.render("cadastrar")
}else{
    res.redirect('/')
}
// res.render("cadastrar")
})

 /*Esta rota esta fazendo o login do site, ele vai até o banco de dados, conta quantos registros tem no bd, e se 
    for superior a um ele entra na sentença. Ele ve que há um dado igual aquele no banco.*/
    //essa rota do tipo get /login está sendo executada por um link que está em login.handlebars
    app.get('/login', function (req,res) {
        res.render("login")
        req.session.usuariozito = 1
    })




    //criando a rota da session para verificar a tabela correta
    
    //todas as rotas que são do tipo "post" são executadas pelo formulário
    //a rota /login vem do formulário chamado login.handlebars
    app.post('/login2', function(req,res){                    
    //    req.session.email = req.body.email
    //    req.session.senha = req.body.senha
    
    
       ongCadastro.count({where: ({email: req.body.email}, {senha: req.body.senha})}).then(function(dados){
          if(dados >= 1){
              req.session.email = req.body.email
              req.session.senha = req.body.senha
              res.redirect("/restrita")
            }else{
              res.send("Usuário não encontrado no momento")
          }
       }).catch(function(erro){
        res.send("deu tudo errado")
    })
    })


    //esse código vai cadastrar em duas tabelas ao mesmo tempo
    app.post('/cadPessoa',function(req,res){
        req.session.cpf = req.body.cpf
        if(req.file){
            var imagem = req.file.originalname
        }else{
            var imagem = 'naoveio.jpg'
        }//precisa ser criado aqui o código para verificar se a pessoa existe antes de cadastra-la
        pessoa.create({
            nome:req.body.nome,
            endereco:req.body.endereco,
            cpf:req.body.cpf
        }).then(function(){
            pessoa.findAll({where:{cpf:req.session.cpf}}).then(function(doadores){
                idPessoa = doadores.map(pagamento => pagamento.toJSON().id)
                console.log(idPessoa)
                /*
                usuario_padrao = req.session.cpf
                senha_padrao = 'user123'*/
                usuario.create({
                    usuario:req.session.cpf,
                    senha:'user123',
                    foto:imagem,
                    Pessoaid:idPessoa.toJSON()
                }).then(function(){
                    res.redirect("/")
                    //(código comentado nas linhas 138,139,149 a 154), descomentar depois de corrigir o erro para testar se essa função está funcionando
                    /*
                    notificar.notificando(
                        'tiagoskierzynski@gmail.com',
                        '',//aqui vai a senha da conta que envia
                        'andre@reitoria.url.br',
                        usuario_padrao,
                        senha_padrao
                    )
                    */
                })
            })
        })
    })


    const upload = multer({storage})

    //Aqui destrói a sessão criada após fazer login.
    //todas as rotas do tipo "get" costumam ser executadas por links
        //essa rota do tipo get /sair está sendo executada por um link que está em main.handlebars
    //EFETUAR LOGOFF
    app.get('/sair', function(req,res){
        req.session.destroy(function(){
            res.render('paginaInicial')
        })
    })
    //FIM DO EFETUAR LOGOFF

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
            res.render('login',{ong: ongs.map(cadastramento => cadastramento.toJSON())})
    })
    }).catch(function(erro){
        res.send("Erro"+erro)
    })
})

/*
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
*/

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
        ongCadastro.findAll({where:{email:req.session.email}}).then(function(ongs){
            res.render('cadastroOng',{ong: ongs.map(cadastramento => cadastramento.toJSON())})
    })
    }).catch(function(erro){
        res.send("Erro"+erro)
    })
})

//criando o delete ong
    //a rota /deleteOng vem do formulário chamado cadastroOng.handlebars (ela é executada logo após ser deletada uma doação)
    app.post('/deleteOng',function(req,res){
        ongCadastro.destroy({
            where:{'id': req.body.id}
        }).then(function(){
            ongCadastro.findAll({where:{email:req.session.email}}).then(function(ongs){
                res.render('cadastroOng',{ong: ongs.map(
                    cadastramento => cadastramento.toJSON())})
            })
    
          .catch(function(){res.send("não deu certo")
            })
        })
    })
   
//TÉRMINO DO CADASTRO DE ONG








//código que pega dados de duas tabelas e adiciona a uma página
    app.get("/restrita",function(req,res){
        if(req.session.email != undefined){    //está linha verifica se existe uma sessão existe, se não ela da undefined
            ongCadastro.findAll( {where:{email:req.session.email}}).then(function(ongs){
                res.render('restrita',{ong: ongs.map(
                    cadastramento => cadastramento.toJSON())})
            })

        }else{
            res.redirect("/login")
        }
    })






    //código que pega dados de duas tabelas e adiciona a uma página
    app.get("/listarOng",function(req,res){
        if(req.session.email != undefined){    //está linha verifica se existe uma sessão existe, se não ela da undefined
            ongCadastro.findAll().then(function(ongs){
                res.render('listarOng',{ong: ongs.map(
                    cadastramento => cadastramento.toJSON())})
            })

        }else{
            res.redirect("/")
        }
    })






//COMEÇANDO AS CONFIGURAÇÕES DE CADASTRO DE DOAÇÕES
//criando tabela de doação
    //a rota /cadDoacao vem do formulário chamado cadastroDoacao.handlebars (ela é executada depois de ser cadastrado uma doação)
app.post('/cadDoacao',function(req,res){
   
    doacaoCadastro.create({
        categoria:req.body.categoria,
        descricao:req.body.descricao,
        nivel:req.body.nivel,
        idOng:req.session.email,

    }).then(function(){
        doacaoCadastro.findAll({where:{'idOng': req.session.email}}).then(function(doacoes){
            res.render('cadastroDoacao',{ong: doacoes.map(cadastradoacao => cadastradoacao.toJSON())})
        }).catch(function(erro){
        res.send("Erro"+erro)
    })
})
})


    //rota para formulario de updateDoacao
        //essa rota do tipo get /updateDoacao está sendo executada por um link que está em cadastroDoacao.handlebars
        app.get('/updateDoacao/:id',function(req,res){
            doacaoCadastro.findAll({ where:{'id':req.params.id}}).then(function(doacoes){
                    res.render('updateDoacao',{doacao: doacoes.map(cadastradoacao => cadastradoacao.toJSON())})
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
        doacaoCadastro.findAll({where:{'idOng': req.session.email}}).then(function(doacoes){
            res.render('cadastroDoacao',{ong: doacoes.map(cadastradoacao => cadastradoacao.toJSON())})
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
        doacaoCadastro.findAll({where:{'idOng': req.session.email}}).then(function(doacoes){
            res.render('cadastroDoacao',{ong: doacoes.map(
                cadastradoacao => cadastradoacao.toJSON())})
        })

      .catch(function(){res.send("Não deu certo")
        })
    })
})

//essa rota do tipo get /cadastroDoacao quando executada leva até o formulário cadastroDoacao, se não estiver logada ela leva até a rota /login
app.get("/cadastroDoacao",function(req,res){
    if(req.session.email != undefined){    //está linha verifica se existe uma sessão existe, se não ela da undefined
        doacaoCadastro.findAll({where:{'idOng': req.session.email}}).then(function(ongs){
            res.render('cadastroDoacao',{ong: ongs.map(
                cadastramento => cadastramento.toJSON())})
        })

    }else{
        res.redirect("/login")
    }
})








//TERMINANDO TODAS CONFIGURAÇÕES DE DOAÇÃO








//CRIANDO NOVA ROTA PARA ACESSAR O PERFIL DA ONG
    //a rota /perfilOng vem do formulário chamado perfilOng.handlebars
app.post('/perfilOng',function(req,res){
    
})
//essa rota do tipo get /perfilOng está sendo executada por um link que está em doeAgora.handlebars
app.get('/perfilOng/:email',function(req,res){
   ongCadastro.findAll({where:{'email': req.params.email}}).then(function(ongs){
        res.render('perfilOng',{ong: ongs.map(cadastramento => cadastramento.toJSON())})
})
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
    doacao.findAll().then(function(lista){
        res.render("doeAgora",{doacao: lista.map(l => l.toJSON())})
    })
})

//rota que está em "cadastro" no menu, que vai definir a qual caminho o usuário deve escolher
//essa rota está parada no momento
app.get("/caminhos", function(req,res){   
    res.render("caminhos")
})





app.get('/fale_conosco',function(req,res){   
    res.render('fale_conosco')
})

app.post('/fale_conosco',function(req,res){
    //console.log(req.body)

    fale_conosco.create({
        //nomenobanco:nomenoformulario,
        nome_solicitante:req.body.nome_solicitante,
        email_solicitante:req.body.email_solicitante,
        relato_solicitante:req.body.relato_solicitante
    }).then(function(){
        res.render('fale_conosco',{mensagem:'Cadastrado com sucesso!!!'})
    })
})









//rota para formulario de cadastroOng
    //essa rota do tipo get /cadastroOng está sendo executada por um link que está em main.handlebars
app.get('/cadastroOng',function(req,res){
    if(req.session.email){    
    ongCadastro.findAll({where:{email:req.session.email}}).then(function(ongs){
        res.render('cadastroOng',{ong: ongs.map(cadastramento => cadastramento.toJSON())})
    })
}else{
    res.render('cadastroOng')
}    
})

//rota para formulario de updateOng
    //essa rota do tipo get /updateOng está sendo executada por um link que está em cadastroOng.handlebars
app.get('/updateOng/:id',function(req,res){
    ongCadastro.findAll().then(function(ongs){
            res.render('updateOng',{ong: ongs.map(cadastramento => cadastramento.toJSON())})
    })
})






app.listen(3000);