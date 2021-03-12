"use strict"


var jwt= require("jwt-simple");
var moment= require("moment");
var secret= ("clave_secreta");

exports.createToken = function(usuario){
    var payload = {
        sub: usuario._id,
        Usuario :  usuario.Usuario,
        rol: usuario.rol,
        iat: moment().unix(),
        exp: moment().day(15, "days").unix()
    }
    return jwt.encode( payload, secret);

}


