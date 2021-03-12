"use strict"
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var FacturaSchema= Schema({
    idUsuario:{type:Schema.Types.ObjectId, ref: "usuario" },
    FechaDeEmision: String,

    FacturaEditable: Boolean,
    
    Carrito:[{
        idProducto:{type:Schema.Types.ObjectId,ref: "productos"},
        cantidad: Number,
        SubTotal: Number
    }],
    
    Total: String
    


})

module.exports =  mongoose.model("factura", FacturaSchema);