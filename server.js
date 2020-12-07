const usuario = require("./models/usuario")

const express = require("express")
const app = express()

app.listen(3000);

app.get('/formulario',function(req,res){
    usuario.findAll().then(function(doadores){
        res.render("formulario",{doador: doadores.map(pagamento => pagamento.toJSON())})
    })
})

const handlebars = require("express-handlebars")
const bodyParser = require("body-parser")

app.engine('handlebars',handlebars({defaultLayout:'main'}))
app.set('view engine','handlebars')

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

app.use('/static', express .static(__dirname + '/public'));

//esse bloco é disparado pelo enviar do formulario
app.post('/cadUsuario',function(req,res){
    usuario.create({
        nome:req.body.nome,
        senha:req.body.senha
    }).then(function(){
        res.render("formulario")
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