const nodemailer = require('nodemailer');

exports.notificando = function(remetente,senha1,destinatario,usuario_p,senha_p){

    const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: remetente,
        pass: senhai
    },
    tls: { rejectUnauthorized: false }
    });

    const mailoptions = {
    from: remetente,
    to: destinatario,
    subject: 'E-mail enviado usando Node!',
    text: 'ola, seu usuario é '+usuario_p+' e sua senha padrão é '+senhe_P
    };
    transporter.sendMail(mailOptions, function(error, info){
    if (error) {
    console.log(error);
    } else {
    console.log('Email enviado: ' + info.response);
    }
    });
}