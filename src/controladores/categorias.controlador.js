"use strict"

var Categoria = require("../modelos/categorias.model")
var Productos = require("../modelos/productos.model")
var factura = require("../modelos/factura.model")


//Default
function GuardarCategoriaD( res){
    
    var ModelCategoria =  new Categoria();
    
    
                ModelCategoria.Nombre = "Default"

                Categoria.find({Nombre: ModelCategoria.Nombre}).exec((err, categoriaG)=>{
                    if(err) return res.status(500).send({mensaje:"Error en peticion agregar"})
    
                    if(categoriaG.length == 0){
                        ModelCategoria.save((err, Csaved)=>{
                            if(err) return console.log("Error al guardar categoria")
                            if(!Csaved) return console.log("Error al Guardar")
                            
                            return console.log("Categoria Default funcionando")
    
    
                        })
    
    
    
                    }else{
                        return console.log("La Categoria Default funcionando")
                    }
                })
    
    
    }

    
// Guardar Categoria

function GuardarCategoria(req, res){
var ModelCategoria =  new Categoria();
var params = req.body;
    if(req.user.rol == "ROL_ADMIN"){
    if(!params.Nombre){    return res.status(404).send({mensaje:"No se envio el parametro necesario"})
    }

            ModelCategoria.Nombre = params.Nombre

            Categoria.find({Nombre: ModelCategoria.Nombre}).exec((err, categoriaG)=>{
                if(err) return res.status(500).send({mensaje:"Error en peticion agregar"})

                if(categoriaG.length == 0){
                
                    ModelCategoria.save((err, Csaved)=>{
                        
                        if(err) return res.status(500).send({mensaje:"Error al guardar categoria"})
                        if(!Csaved) return res.status(500).send({mensaje:"Error al Guardar"})
                        
                        return res.status(200).send({Csaved})


                    })



                }else{                    return res.status(500).send({mensaje:"La categoria ya existe"})
            }
            })

      
    }else{    return res.status(500).send({mensaje:"Un cliente no puede agregar categoria"})
}

}



//Mostrar categorias

function MostrarCategorias(req, res){
    Categoria.find().exec((err, Categorias)=>{
        if(err) return res.status(500).send({mensaje:"Error en la peticion mostrar Categorias"})
        if(!Categorias) res.status(500).send({mensaje:"Error en la peticion Mostrar Categorias o no tiene datos"})
        return res.status(200).send({Categorias});
    })


}

//Editar categorias

function EditarCategoria(req, res){
var idCategoria = req.params.id;


var params = req.body;
        if(req.user.rol == "ROL_ADMIN"){

            factura.find({FacturaEditable: true}).exec((err, Facturas)=>{
                if(Facturas.length >= 1) return res.status(500).send({mensaje:"aborte la factura en proceso antes de modificar los productos"})
        

            Categoria.findByIdAndUpdate(idCategoria,params,{new:true}, (err, CategoriaUpdate)=>{
                if(err) return res.status(500).send({mensaje:"Error en la peticion update Categorias"})
                if(!CategoriaUpdate) res.status(500).send({mensaje:"Error en la peticion Update Categorias"})
                return res.status(200).send({CategoriaUpdate});


            })
        })
        }else{        return res.status(500).send({mensaje:"Un cliente no puede Editar categoria"})
    }
}

//Eliminar Categorias

function EliminarCategoria(req, res){
var idCategoria = req.params.id;


    if(req.user.rol == "ROL_ADMIN"){

        factura.find({FacturaEditable: true}).exec((err, Facturas)=>{
            if(Facturas.length >= 1) return res.status(500).send({mensaje:"aborte la factura en proceso antes de modificar los productos"})
    



        Categoria.find({_id: idCategoria, Nombre: "Default"},(err,CatDefault)=>{
            if(CatDefault.length >= 1) return res.status(500).send({mensaje:"Imposible eliminar Default de Categorias"})

        Categoria.findByIdAndDelete(idCategoria, (err, CategoriaDelete)=>{
            if(err) return res.status(500).send({mensaje:"Error en la peticion delete Categorias"})
            if(!CategoriaDelete){ res.status(500).send({mensaje:"Error en peticion delete Categorias o ya fue eliminada"})
        }else{

            Categoria.findOne({Nombre :"Default"}, (err, CDefault)=>{
                if(err) return res.status(500).send({mensaje:"error al implementar categoria Default"})
                if(!CDefault) return res.status(500).send({mensaje:"No se encontro la categoria Default"})
                var Cdefault= CDefault._id;
                
                Productos.updateMany({idCategoria:idCategoria },{idCategoria : Cdefault },(err, ProductoUpdate)=>{
            
                    if(err) return res.status(500).send({mensaje:"Error al actualizar"})
        
                })

                return res.status(200).send({CategoriaDelete});

            })

        }
        })
    })
    })
    }else{    return res.status(500).send({mensaje:"Un cliente no puede Eliminar categoria"})
}
    
}

//Mostrar Productos con Categoria

function ObtenerProductosCategoria(req, res){
    var idCategoria = req.params.id;

    Productos.find({idCategoria:idCategoria},(err, ProductosObtenidos)=>{

        Productos.populate(ProductosObtenidos, {path: "idCategoria"},(err, ProductoObtenidos)=>{
        if(err) return res.status(500).send({mensaje:"Error al obtener el producto "})
        return  res.status(200).send({ProductoObtenidos})
        })
    })
    
}


module.exports={ GuardarCategoria,MostrarCategorias,EditarCategoria,EliminarCategoria,GuardarCategoriaD,ObtenerProductosCategoria}
