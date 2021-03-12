"use strict"

const bodyParser = require("body-parser");
//variables

const express = require("express");
const app  = express();

//IMPORTacion DE ruta
var proyecto_rutas = require("./src/rutas/proyecto.rutas")


app.use(bodyParser.urlencoded({extended:false}));
app.use (bodyParser.json());
//aplicacion de rutas localhost:3000/api/ejemplo
app.use("/api", proyecto_rutas)

//Exportacion
module.exports = app;
