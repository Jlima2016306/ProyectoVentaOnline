"use strict"

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CategoriaSchema = Schema({
    Nombre: String
});

module.exports= mongoose.model("Categoria", CategoriaSchema)