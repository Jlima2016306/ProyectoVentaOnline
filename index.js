//SyntaxError: Invalid shorthand property initializer

const mongoose = require("mongoose")
const app = require("./app")
var UsuarioControlador = require("./src/controladores/usuario.controlador");
var CategoriaControlador = require("./src/controladores/categorias.controlador");


mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/proyectoFinalBim1",{useNewUrlParser: true, useUnifiedTopology: true}).then(()=>{

console.log("Usted se conecto a la base de datos")
    app.listen(3000, function(){
        console.log("Corriendo en puerto 3000")
        UsuarioControlador.UserAdmin();
        CategoriaControlador.GuardarCategoriaD();
    })

}).catch(err => console.log(err))

