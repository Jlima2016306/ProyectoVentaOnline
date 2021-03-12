"use strict"

var Productos = require("../modelos/productos.model")
var Categorias = require("../modelos/categorias.model")
var Factura = require("../modelos/factura.model")
//guardar Productos

function GuardarProducto(req,res){
var ProductosModel = new Productos();


var params = req.body;



        if(req.user.rol === "ROL_ADMIN"){
            if(params.Nombre && params.Descripcion && params.Precio && params.Stock && params.idCategoria){
                ProductosModel.Nombre = params.Nombre;
                ProductosModel.Descripcion = params.Descripcion;
                ProductosModel.Stock = params.Stock;
                ProductosModel.Precio = params.Precio;
                
                ProductosModel.idCategoria = params.idCategoria;
                Categorias.find({_id:ProductosModel.idCategoria},(err,CategoriaExist)=>{
                if(CategoriaExist.length === 0) return res.status(500).send({mensaje:"No existe la Categoria"})
                ProductosModel.Vendidos= 0;


                Productos.find({Nombre: ProductosModel.Nombre}, (err, ProductosGuardados)=>{
                    if(err) return res.status(500).send({mensaje:"Error en la peticion guardar"})

                    if(ProductosGuardados.length === 0){
                        ProductosModel.save((err, ProductoGuardado)=>{
                            if(err) return res.status(500).send({mensaje:"Error al Guardar"})
                            if(!ProductoGuardado) res.status(500).send({mensaje:"Error en la peticion guardar"})
                            return res.status(200).send({ProductoGuardado});


                        })

                    }else{                    return res.status(500).send({mensaje:"El producto ya existe"})
                }

                })
            })
            }else{            return res.status(500).send({mensaje:"No se enviaron los parametros correspondientes"})
        }

        
        }else{        return res.status(500).send({mensaje:"Solo el admin puede agregar productos"})
    }
}

///Obtenes productos
function ObtenerProductos(req, res){
    Productos.find((err, ProductosObtenidos)=>{
        Categorias.populate(ProductosObtenidos, {path:"idCategoria"},(err, Productos)=>{


        if(err) return res.status(500).send({mensaje:"Error al obtener el producto "})
        if(!Productos) return res.status(500).send({mensaje:"Error al obtener o No hay datos"})
        return res.status(200).send({Productos})

        })
    })

}




//Editar Productos
function EditarProductos(req, res){
    var idProducto = req.params.id;
    var params = req.body;
    if(params.Vendidos && params.Vendidos == null) return res.status(500).send({mensaje:"No puede enviar el parametro Vendidos Vacio"})

    Factura.find({FacturaEditable: true}).exec((err, Facturas)=>{
        if(Facturas.length >= 1) return res.status(500).send({mensaje:"aborte la factura en proceso antes de modificar los productos"})
        if(req.user.rol ==="ROL_ADMIN"){
            if(params.idCategoria){
                var id = params.idCategoria
            Categorias.findOne({_id: id},(err,CategoriaExist)=>{
                
            if(err)return res.status(500).send({mensaje:"No existe la Categoria"})
            if(!CategoriaExist) return res.status(500).send({mensaje:"No existe la Categoria"})

            if(CategoriaExist.length == 0) return res.status(500).send({mensaje:"No existe la Categoria"})

            Productos.findByIdAndUpdate(idProducto,params,{new:true},(err, ProductoUpdate)=>{
                        
                    if(err) return res.status(500).send({mensaje:"Error al actualizar"})
                    if(!ProductoUpdate) return res.status(500).send({mensaje:"Error al actualizar Producto"})
                    return res.status(200).send({ProductoUpdate});
                
                })
            })
            }else{

                    Productos.findByIdAndUpdate(idProducto,params,{new:true},(err, ProductoUpdate)=>{
                        
                        if(err) return res.status(500).send({mensaje:"Error al actualizar"})
                        if(!ProductoUpdate) return res.status(500).send({mensaje:"Error al actualizar Producto"})
                        return res.status(200).send({ProductoUpdate});
                    
                    })
                }
       

        }else{    return res.status(500).send({mensaje:"Solo el administrador puede Editar un Producto"})
    }

})
}


//busc
function ObtenerNombreProductos(req, res){
    var Nombre = req.params.Nombre
    Productos.find({Nombre:Nombre},(err, ProductosObtenidos)=>{
        Categorias.populate(ProductosObtenidos, {path:"idCategoria"},(err, Productos)=>{


        if(err) return res.status(500).send({mensaje:"Error al obtener el producto "})
        if(!Productos) return res.status(500).send({mensaje:"Error al obtener o No hay datos"})
        return res.status(200).send({Productos})

        })
    })
}





//Eliminar Productos
function EliminarProductos(req, res){

Factura.find({FacturaEditable: true}).exec((err, Facturas)=>{
        if(Facturas.length >= 1) return res.status(500).send({mensaje:"aborte la factura en proceso antes de modificar los productos"})

    if(req.user.rol != "ROL_ADMIN") return res.status(500).send({mensaje:"Solo los administradores puende eliminar productos "})
    var idProducto = req.params.id;

    Productos.findByIdAndDelete(idProducto,(err, ProductoEliminado)=>{
        Categorias.populate(ProductoEliminado, {path: "idCategoria"},(err, ProductoEliminados)=>{
            if(err) return res.status(500).send({mensaje:"Error al obtener el producto "})
            
        if(!ProductoEliminados) return res.status(500).send({mensajes:"Error al eliminar o El producto ya ha sido eliminado"})
        
        
        return res.status(200).send({ProductoEliminados})
    })

    })

})


}

//Productos en Stock 0

function ObtenerProductosStock0(req, res){
    Productos.find({Stock:0},(err, ProductosVacios)=>{
        Categorias.populate(ProductosVacios, {path:"idCategoria"},(err, ProductosStokVacios)=>{


        if(err) return res.status(500).send({mensaje:"Error al obtener el producto "})
        if(!ProductosStokVacios) return res.status(500).send({mensaje:"Error al obtener o No hay datos"})
        if(ProductosStokVacios.length == 0) return res.status(200).send({mensaje:"No hay Productos Vacios"})
        return res.status(200).send({ProductosStokVacios})


        })
    })


}

//Mas Vendidos
function ObtenerProductosVendidos(req, res){
    Productos.find({},(err, ProducosVendidos)=>{
        var TopProducto = ProducosVendidos.sort(((a,b)=> b.Vendidos-a.Vendidos  ));
        res.status(200).send({TopProducto})

        
    })


}

module.exports ={GuardarProducto,
    
    ObtenerProductos,
    EliminarProductos,ObtenerProductosStock0,ObtenerProductosVendidos,ObtenerNombreProductos,EditarProductos}