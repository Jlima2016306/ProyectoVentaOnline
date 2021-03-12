"use strict"

var express = require("express");
var UsuarioControlador = require("../controladores/usuario.controlador");
var CategoriasControlador = require("../controladores/categorias.controlador");
var ProductosControlador = require("../controladores/productos.controlador");
var FacturaControlador = require("../controladores/factura.controlador");

var md_autorizacion = require("../middlewares/authenticated.js");

//RuTas
var api = express.Router()
    //Usuario
api.post("/registrar", UsuarioControlador.registrar)
api.get("/obtenerUsuarios", md_autorizacion.ensureauth ,UsuarioControlador.obtenerUsuario)
api.post("/login", UsuarioControlador.login)
api.get("/obtenerUsuarioID/:iDUsuario", md_autorizacion.ensureauth ,UsuarioControlador.obtenerUsuarioID)
api.put("/editarUsuario/:id", md_autorizacion.ensureauth, UsuarioControlador.editarUsuario)
api.put("/eliminarUsuario/:id",md_autorizacion.ensureauth, UsuarioControlador.EliminarUsuario)
    //Categoria
api.post("/agregarCategoria", md_autorizacion.ensureauth, CategoriasControlador.GuardarCategoria);
api.get("/obtenerCategorias", md_autorizacion.ensureauth, CategoriasControlador.MostrarCategorias);
api.put("/editarCategoria/:id",md_autorizacion.ensureauth, CategoriasControlador.EditarCategoria);
api.put("/eliminarCategoria/:id", md_autorizacion.ensureauth, CategoriasControlador.EliminarCategoria);

api.get("/ObtenerCategorias/:id", md_autorizacion.ensureauth, CategoriasControlador.ObtenerProductosCategoria);

    //Productos 
api.post("/agregarProducto",md_autorizacion.ensureauth, ProductosControlador.GuardarProducto);
api.get("/obtenerProductos",md_autorizacion.ensureauth, ProductosControlador.ObtenerProductos)
api.put("/editarProducto/:id",md_autorizacion.ensureauth, ProductosControlador.EditarProductos)
api.put("/eliminarProducto/:id",md_autorizacion.ensureauth, ProductosControlador.EliminarProductos)
api.get("/StockVacio",md_autorizacion.ensureauth, ProductosControlador.ObtenerProductosStock0);
api.get("/TopProductos", md_autorizacion.ensureauth, ProductosControlador.ObtenerProductosVendidos);

    //Factura
api.post("/iniciarFactura",md_autorizacion.ensureauth, FacturaControlador.IniciarFact)
api.get("/obtenerFacturas",md_autorizacion.ensureauth, FacturaControlador.mostrarFacturas)
api.put("/agregarACarrito/:id",md_autorizacion.ensureauth, FacturaControlador.Carrito);
api.put("/FinalizarFatura/:id",md_autorizacion.ensureauth, FacturaControlador.FinFactura);
api.get("/FacturaDetallada/:id",md_autorizacion.ensureauth, FacturaControlador.mostrarFacturasID);


module.exports = api;
