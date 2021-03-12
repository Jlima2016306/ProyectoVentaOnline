"use strict"

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ProductoSchema =  Schema({
    Nombre : String,
    Descripcion : String,
    Precio : Number,
    Stock : Number,
    idCategoria : {type:Schema.Types.ObjectId ,ref: "Categoria"},
    Vendidos: Number

})

module.exports = mongoose.model("productos", ProductoSchema);