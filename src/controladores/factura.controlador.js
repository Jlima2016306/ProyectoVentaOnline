"Use strict"

factura = require("../modelos/factura.model")
Producto = require("../modelos/productos.model")
const date = require('date-and-time');

//Se inicia la factura

function IniciarFact(req,res){
var facturaModelo = new factura()

facturaModelo.idUsuario = req.user.sub;
facturaModelo.FacturaEditable = true
//se verifica  que solo se encuentre una factura editandose


factura.find({FacturaEditable : facturaModelo.FacturaEditable}).exec((err, FacturaEnProcesos)=>{

    if(err) return res.status(500).send({mensaje:"Error al iniciar factura"});

    if( FacturaEnProcesos.length >= 1){
        return res.status(200).send({mensaje:"Factura ya Iniciada:", FacturaEnProcesos})


    }else{

        facturaModelo.save((err, FacturaCorriendo)=>{
            if(err) return res.status(500).send({mensaje:"Error al Iniciar Factura"})
            return res.status(200).send({FacturaCorriendo})


        })        
    }

})


}

function mostrarFacturas(req, res){
    if(req.user.rol == "ROL_CLIENTE"){
        factura.find({idUsuario :req.user.sub}).exec((err, Facturas)=>{
            if(err) return res.status(500).send({mensaje:"error al obtener facturas"})
            if(Facturas.lenght < 0) return res.status(500).send({mensaje:"Error en la peticion o no hay facturas"})
            return res.status(200).send({Facturas})

        })
    }else{

    factura.find().exec((err, Facturas)=>{
        if(err) return res.status(500).send({mensaje:"error al obtener facturas"})
        if(Facturas.lenght < 0) return res.status(500).send({mensaje:"Error en la peticion o no hay facturas"})
        return res.status(200).send({Facturas})
    })
}

}

function Multiplicacion(Product, cantidad){

    return Product.Precio * cantidad

}

function restaStock(Product, cantidad){      
        var productoTotal= Product.Stock - cantidad

        return productoTotal
}

function Carrito(req, res){
    var idFactura = req.params.id;
    var params = req.body;
    var idProducto = params.idProducto;


var cantidad = params.cantidad;
    if(params.idProducto && params.cantidad){
        //buscamos el producto
        Producto.findById(idProducto).exec((err, Product)=>{
            if(err) return res.status(500).send({mensaje:"Error"})
            //almacenamos la funcion multiplicar que nos dara la cantidad que costara comprar esa cantidad de productos
            var Subtotal = Multiplicacion(Product,cantidad)
            //validamos que la multiplicacion salga como 0
            if(Subtotal === 0 ) return res.status(400).send({mensaje:"No se encontro el producto, o la cantidad es 0"})


            //buscamos la factura
            factura.findOne({_id:idFactura , "Carrito.idProducto":idProducto, }).exec((err, Facturas)=>{
                if(Facturas.idUsuario != req.user.sub) return res.status(500).send({mensaje:"No puede agregar productos a un carrito ageno"})

                if(err) return res.status(500).send({mensaje:"error al obtener facturas"})

                //revisamos que ya haya carrito, si no obviamos esta parte
                if(Facturas != null){
                    
                    if(Facturas.Carrito.length > 0){
                        let i
                        var suma = cantidad
                        var Precio = Subtotal
                        //recorremos el carrito
                        for(i=0; Facturas.Carrito.length > i; i++){
                            const item =Facturas.Carrito[i]
                            //verificamos que el producto en el carrito sea el mismo al que ingresamos
                            if(item.idProducto == idProducto){
                                var exist = 1
                                    //sumamos las cantidades de los paquetes de productos que se hayan ingresado
                                suma = Number(item.cantidad) + Number(suma)
                                Precio = item.SubTotal + Precio

                            }
                        }

                        //eviamos la suma para ver si con este siguiente paquete de productos no excedemos el stock
                        //restaStock solo simula la resta y no la ejecuta en la base de datos
                        var restasStock =  restaStock(Product, suma)
                        //verificamos que hayan suficientes productos
                        if(restasStock < 0 ) return res.status(400).send({mensaje:"No hay suficientes Productos en Stock"})

                        
                    }
                    

                }
                if(exist == 1){
                    factura.findOneAndUpdate({_id: idFactura,"Carrito.idProducto":idProducto},{"Carrito.$.cantidad":suma,"Carrito.$.SubTotal": Precio},{new: true}, 

                    (err, En_Carrito)=>{
    
                        factura.populate(En_Carrito, {path: "Carrito.idProducto"},(err, Carrito)=>{
                            
                        if(err) return res.status(500).send({mensaje:"Error al ingresar Producto"})
                        if(!Carrito) return res.status(500).send({mensaje:"La factura no existe"})
    
                        return res.status(200).send({Carrito})
                        })
                    })
                
                }else
                {    
      
            //guardamos la simulacion de la resta de productos, aunque aqui parezca no necesario, sirve para cuando se ingresa el primer paquete de productos en el carrito
            var restasStock =  restaStock(Product, cantidad)

            //verificamos que hayan suficientes productos
            if(restasStock < 0 ) return res.status(400).send({mensaje:"No hay suficientes Productos en Stock"})
            //enviamos el producto al carrito

            factura.findByIdAndUpdate(idFactura ,{$push:{Carrito:{idProducto:idProducto, cantidad:cantidad, SubTotal:Subtotal}}},{new: true}, 
                (err, En_Carrito)=>{

                    factura.populate(En_Carrito, {path: "Carrito.idProducto"},(err, Carrito)=>{
                        
                    if(err) return res.status(500).send({mensaje:"Error al ingresar Producto"})
                    if(!Carrito) return res.status(500).send({mensaje:"La factura no existe"})

                    return res.status(200).send({Carrito})
                    })
                })
            }
            })

        })
    }else{
        return res.status(200).send({mensaje:"No se enviaron los parametros correspondientes "})
    }

}


//hay sagre, sudor y lagrimas en las siguientes funciones. 
function Precio_total(Factura){

    let i
    let SumaTotal=0
    for(i=0; Factura.Carrito.length > i; i++){
        const item = Factura.Carrito[i]

        SumaTotal=  Number(item.SubTotal) + Number(SumaTotal)
    }
    return SumaTotal

    
}

function restaStockR(idProuct, cantidad){    
    Producto.findById(idProuct).exec((err, Product)=>{
    
    var productoTotal= Product.Stock - cantidad
    var Vendidos = Product.Vendidos + cantidad


    Producto.findByIdAndUpdate(idProuct ,{Stock: productoTotal, Vendidos: Vendidos},{new: true},(err, guardado)=>{
        console.log(productoTotal)
      
        if(err)  error ="Error"
        if(!guardado)  error="Error"
        

    })       

})

}

function FinFactura(req, res){
    var params = req.body
    var FinFactura= params.FinFactura
    var idFactura = req.params.id;

    var error=1
    let cantidad
    let i
    let idProuct
    if(FinFactura != "true" && FinFactura !="false")  return res.status(500).send({mensaje:"Solo puede eligir entre true y false para FinFactura"})
    factura.findOne({_id: idFactura}).exec((err, Facture)=>{
        if(Facture.idUsuario != req.user.sub) return res.status(500).send({mensaje:"No puede emitir ni eliminar una factura agena"})


    factura.find({_id: idFactura, FacturaEditable:false}).exec((err, facture)=>{
        if(facture.length > 0){ return res.status(500).send({mensaje:"La factura ya ha sido emitida"})}

    if(FinFactura == "false" ){
        factura.findByIdAndDelete(idFactura, (err, FacturaCancelada)=>{
            if(err) return res.status(500).send({mensaje:"Error al cancelar la factura"})
            if(!FacturaCancelada) return res.status(500).send({mensaje:"No hay datos o Ya ha sido eliminada"})
            return res.status(200).send({FacturaCancelada})
        })

    }else{
        factura.findOne({_id:idFactura },{Carrito:1}).exec((err, Facturas)=>{

            if(err) return res.status(500).send({mensaje:"error al obtener facturas"})
            var Precio = Precio_total(Facturas)
            var suma= 0

  
            for(i=0; Facturas.Carrito.length > i; i++){

                if(error != "Error"){

                const item = Facturas.Carrito[i]
                idProuct = item.idProducto
                cantidad = item.cantidad



                    restaStockR(idProuct,cantidad)

                 }
    
    
    
            }
    
            const now = new Date();
            var fech = date.format(now, 'DD-MM-YYYY');

            factura.findByIdAndUpdate(idFactura ,{FechaDeEmision:fech ,FacturaEditable: false ,Total: Precio},{new: true},
                (err, En_Carrito)=>{

                    Producto.populate(En_Carrito, {path: "Carrito.idProducto"},(err, Factura)=>{
                        
                    if(err) return res.status(500).send({mensaje:"Error al ingresar Producto"})
                    if(!Carrito) return res.status(500).send({mensaje:"La factura no existe"})

                    return res.status(200).send({Factura})
                    })
                })

            

        })
        

    }

})
    })
}


function mostrarFacturasID(req, res){
    var idFactura = req.params.id;
    if(req.user.rol == "ROL_CLIENTE"){

        factura.find({idUsuario :req.user.sub , _id: idFactura }).exec((err, Facturas)=>{
            
            if(err) return res.status(500).send({mensaje:"error al obtener facturas"})
            if(Facturas.length == 0) return res.status(500).send({mensaje:"Error en la peticion o usted no posee esa facturas"})
            Producto.populate(Facturas, {path: "Carrito.idProducto"},(err, Factura)=>{
                        
                if(err) return res.status(500).send({mensaje:"Error al ingresar Producto"})
                if(!Carrito) return res.status(500).send({mensaje:"La factura no existe"})

                return res.status(200).send({Factura})
                })
        })
    }else{

    factura.find({_id: idFactura}).exec((err, Facturas)=>{
        if(err) return res.status(500).send({mensaje:"error al obtener facturas"})
        if(Facturas.length === 0) return res.status(500).send({mensaje:"Error en la peticion o no hay facturas"})
        Producto.populate(Facturas, {path: "Carrito.idProducto"},(err, Factura)=>{
                        
            if(err) return res.status(500).send({mensaje:"Error al ingresar Producto"})
            if(!Carrito) return res.status(500).send({mensaje:"La factura no existe"})

            return res.status(200).send({Factura})
            })
    })
}

}










module.exports={
                FinFactura,
                mostrarFacturasID,
                Carrito,
                IniciarFact,mostrarFacturas



}