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



app.get('/delete/:id',function(req,res){
    usuario.destroy({
        where:{'id': req.params.id}
    }).then(function(){
        usuario.findAll().then(function(doadores){
            res.render('formulario',{doador: doadores.map(
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


app.get('/formulario',function(req,res){
    usuario.findAll().then(function(doadores){
        res.render("formulario",{doador: doadores.map(pagamento => pagamento.toJSON())})
    })
})



//esse bloco é disparado pelo enviar do formulario
app.post('/cadUsuario',function(req,res){
    usuario.create({
        nome:req.body.nome,
        senha:req.body.senha
    }).then(function(){
        usuario.findAll().then(function(doadores){
            res.render('formulario',{doador: doadores.map(pagamento => pagamento.toJSON())})
        })
    }).catch(function(erro){
        res.send("Erro "+erro)
    })
})

app.get('/paginaInicial',function(req,res){
    res.render("paginaInicial")
})

app.get("/identificador", function(req,res){
    res.render("identificador")
})

app.get("/quemSomos", function(req,res){
    res.render("quemSomos")
})

app.get("/doeAgora", function(req,res){
    res.render("doeAgora")
})

app.get("/login", function(req,res){
    res.render("login")
})

app.get("/cadastro", function(req,res){
    res.render("cadastro")
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