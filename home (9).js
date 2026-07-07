var URLGEneral='https://4664764.app.netsuite.com'
const funcidUnico = () => Math.floor(Math.random() * 10000).toString().padStart(4, '0');

var idUnico1=funcidUnico()
function SendtoBackend(obj,opcion) {
  console.log("SendtoBackend")
  $("#loading,#backfond").show()
     var datos=JSON.stringify(obj);
     var urlbakc=$("#url-backend").val()
   console.log("urlbakc",urlbakc)
     const getDataMetas = async () => {
        const response = await fetch(
            urlbakc,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "data":datos,
                    "opcion":opcion
                },
            }
        );
        const json = await response.json();
        return json;
    };
  return getDataMetas;
}
function limpiar() {
  $("#itemsaved,#idinterno,#itembase,#custitem_imr_modelo_clave,#descripcion,#custitem_imr_color_matriz,#custitem_imr_tamano_matriz,#custitem_imr_tipo_producto_pt").val("")
  
}


const main = () => {
  
    const lista = $('#lista-empleados');

  localStorage.setItem("objEje", "")
   var  searchParams = new URLSearchParams(window.location.search)
   var opcion = searchParams.get('opc')
  


    $("#btnBuscar").on("click", function() {
        var otBuscada = $("#buscarOT").val();
      otBuscada=otBuscada.trim()
      

       var ValidarExiste=$('#tablaOT').find("td:contains('"+otBuscada+"')")
      if(ValidarExiste.length>0){
        alert(otBuscada+" ya se Cargo")
         $('#buscarOT').val("");  
        return
      }

     GetRalacionadas(otBuscada).then(function(existe){

    if(existe){
        alert(" Ot Ya registradas");
      return
    }else{
        var obj={
         'otBuscada':otBuscada,
          'supervisor': $('#supervisor').attr("idsupervisor")
       }
        var response = SendtoBackend(obj,'getOtInformation')
                 response().then((response) => {
                    console.log(response)
                   if(response.Response)
                   {
                     var information=response.Response
                       var Bihorario=information.Bihorario
                      var tieneSiguiente=information.next

               

                     var OTprincipal=information.OtPrincipal
                     var OTS=information.response
                     console.log(Object.keys(OTS).length)
                     if(Object.keys(OTS).length> 0){
                         agregarFilas(OTS)
                     cargarRegistrosAlmacenadosConEfecto(Bihorario,tieneSiguiente)
                       
                     }else{
                       alert(' Ot Sin Ruta Registrada')
                     }

                    
                     
                      $('#buscarOT').val("");  
                     var input= $('#tablaOT').find("input")
                       input.css({
           "width": "90%"
   
    });
                     
                    
                   }else{
                        $('#buscarOT').val("");                       
                     alert("Fallo")
                   }
          $("#searchTrasaction").val("")
          $("#loading,#backfond").hide()
     });
      
    }

});
      
     
    
      
     
      

    });



   $("#btnLoadBiho").on("click", function() {
     
        let idSupervisor = $('#supervisor').attr("idsupervisor");
     
       var ValidarExiste=$('tr[data-ot-id]').length


     
     if(ValidarExiste>0){
       alert("Ya hay un Bihorario Cargado")
       return
     }

       var obj={
         'idSupervisor':idSupervisor
       }
        var response = SendtoBackend(obj,'getbihorarios')
                 response().then((response) => {
                    console.log(response)
                   if(response.Response)
                   {
                     var information=response.Response
                     console.log(information)
                     if(information.response==0){
                        $("#loading,#backfond").hide()
                       return
                     }
                       var Bihorario=information.Bihorario
                    
                     
                          var tieneSiguiente=information.next
               

                     var OTprincipal=information.OtPrincipal
                     var OTS=information.response

                      agregarFilas(OTS)
                     cargarRegistrosAlmacenadosConEfecto(Bihorario,tieneSiguiente)
                      $('#buscarOT').val("");  
                     
                    
                     var input= $('#tablaOT').find("input")
                       input.css({
           "width": "90%"
   
    });
                                          
                    //   $('#buscarOT,#btnBuscar,.form-label').remove();  
                    
                   }else{
                        $('#buscarOT').val("");                       
                     alert("Fallo")
                   }
          $("#searchTrasaction").val("")
          $("#loading,#backfond").hide()
     });
      
    });
  


   $("#btnsigBiho").on("click", function() {


      var $filasDetalle = $('#cuerpoTabla').find(`tr.fila-encontrada[data-seguimiento-id]:not([data-seguimiento-id="0"])`);
     

      var IDSpadres=[]
       $filasDetalle.each(function() {
           var $fila = $(this);
           var idpadre=parseFloat($fila.attr('data-ot-id'))
         IDSpadres.push(idpadre)
        });
     
  var obj={
              'Detalle':IDSpadres,
              'terminar':false,
             // 'bihorarioAct': $("#noBiho").attr('noact'),
              'opcion':'siguiente',
              'supervisor': $('#supervisor').attr("idsupervisor")
       }
     try {
               var response = SendtoBackend(obj,'setbihorarioDetalle')
                 response().then((response) => {
                    console.log(response)
                   if(response.Response)
                   {
                     var informacion=response.Response
                     var Bihorario=informacion.respuesta
                      var tieneSiguiente=informacion.next
                       cargarRegistrosAlmacenadosConEfecto(Bihorario,tieneSiguiente) 
                     var input= $('#tablaOT').find("input")
                       input.css({"width": "90%"});
var bihoAct= $("#noBiho").attr('noact')
                     const existeTrue = Object.values(tieneSiguiente).some(valor => valor === true);
                            if(!existeTrue){
                              let respuesta = confirm("Todas las Asignaciones Terminaron en el bihorario:"+bihoAct+", ¿Forzar el siguiente?");
                             if(respuesta){
                              //crear el bihorario vacio 
                               obj.opcion='ForzarNext'
                                forzarSiguienteBihorario(obj)
                             }
                            }
                     
                   }else{
                        $('#buscarOT').val("");                       
                     alert("Fallo")
                   }
          $("#searchTrasaction").val("")
          $("#loading,#backfond").hide()
     });
       
     } catch (error) {
       $("#searchTrasaction").val("")
          $("#loading,#backfond").hide()
     }


    });
  
      // Lógica para Clonar Fila
    $(document).on("click", ".btn-clonar", function() {
        // Clonamos la fila actual
        const $filaOriginal = $(this).closest("tr");      
        const $filaClonada = $filaOriginal.clone();

       GuardarFila($filaOriginal)
      
      return
      
    });
  
     $(document).on("change", ".sumar-detalle", function() {
        // Clonamos la fila actual
          const $fila = $(this).closest("tr");
          var SeguimientoId=$fila.attr('data-detalle-id')
      
        var cantidadAct=$fila.find('.qty-detalle').text()
        var Qty=$(this).val()
       var NuevoValor=parseInt(cantidadAct)+parseInt(Qty)


          const confirmar = confirm(
        `¿Estás seguro de sumar ${Qty} ?`
    );
         if (!confirmar) {
        $(this).val("")
        return;
    }
       
       
            var obj={
           'idDetalle':SeguimientoId,
              'qty':NuevoValor,
              'opcion':'sumar'
       }
        var otId=$fila.attr('data-target-ot')
       var opId=$fila.attr('data-target-op')
         var idpadre=$fila.attr('padre')
        var response = SendtoBackend(obj,'setbihorarioDetalle')
                 response().then((response) => {
                    console.log(response)
                   if(response.Response)
                   {
                     var information=response.Response 
                     if(information==SeguimientoId){
                       var esperado= $fila.find('.qty-acciones').text()
                       $fila.find('.qty-detalle').text(NuevoValor)
                       $fila.find('input').val("")
                    //   var Newporcent=(NuevoValor/esperado)*100
                   ///    Newporcent=Newporcent.toFixed(0)
                    //    $fila.find('.porcenDetalle').text(Newporcent+"%")
                     //  calcularPorcentajeGlobal(otId, opId,idpadre)
                       
                     }
                     
                   }else{
                     alert("fallo")
                   }
          $("#loading,#backfond").hide()
     });
     

    });

    $(document).on("click", ".btn-terminarOp", function() {
        // Clonamos la fila actual
        const $fila = $(this).closest("tr");
      
        var IdBiho=$fila.attr('data-seguimiento-id')
        var otId=$fila.attr('data-ot-id')
        var opId=$fila.attr('data-operacion-id')
      

       var $filasDetalle = $('#cuerpoTabla').find(`tr.fila-detalle-biho[data-target-ot="${otId}"][data-target-op="${opId}"][padre="${IdBiho}"]`);

      var IDSDetalle=[]
       $filasDetalle.each(function() {
           var $fila = $(this);
           var iddetalle=parseFloat($fila.attr('data-detalle-id'))
         var cantidadTerminada=parseFloat($fila.find('.qty-detalle').text())
         IDSDetalle.push(iddetalle+"_"+cantidadTerminada)
        });

        var obj={
             'Detalle':IDSDetalle,
              'terminar':true,
              'opcion':'update'
       }
        var response = SendtoBackend(obj,'setbihorarioDetalle')
                 response().then((response) => {
                    console.log(response)
                   if(response.Response)
                   {
                     var information=response.Response 
                     if( information ){
                       $fila.remove()
                     }
                     console.log(information)
   
                     
                   }else{
                     alert("fallo")
                   }
          $("#loading,#backfond").hide()
     });
     

    });


  
  //accion para buscar el empleado
    $('#tablaOT').on('keyup','.nombre-usuario', function() {
        const $filaOriginal = $(this).closest("tr");
      var idSeguimiento=$filaOriginal.attr('data-seguimiento-id')
      if(idSeguimiento){
        return
      }
      
      
     $(this).removeAttr('data-id-seleccionado');
      let $input = $(this); // El input actual
   
        let valorBusqueda = $input.val();

        // Solo buscar si hay más de 2 caracteres
        if (valorBusqueda.length > 2) {

           let offset = $input.offset();
            lista.css({
                top: offset.top + $input.outerHeight(),
                left: offset.left,
                display: 'block'
            });
          

            var obj={
         'empleado':valorBusqueda
       }
          var response = SendtoBackend(obj,'getEmpleado')
                 response().then((response) => {
                    console.log(response)
                   if(response.Response)
                   {
                     var resultados=response.Response
                     lista.empty();
                     
                        resultados.forEach(emp => {
                            lista.append(`
                                <button type="button" class="list-group-item list-group-item-action item-empleado" 
                                    data-id="${emp.id}" 
                                     data-turno="${emp.turno}" 
                                      data-tiempo="${emp.tiempoJornada}" 
                                      data-id="${emp.id}" 
                                    data-nombre="${emp.fullName}">
                                    <small><strong>${emp.entityId}</strong> - ${emp.fullName}</small>
                                </button>
                            `);
                        });
                     lista.data('input-activo', $input);
                  
                    
                   }else{
                     // lista.append('<div class="list-group-item">No se encontraron resultados</div>');
                     lista.hide();
                   }
          $("#searchTrasaction").val("")
          $("#loading,#backfond").hide()
     });
        } 
   
    });
    $('#tablaOT').on('blur', '.nombre-usuario', function() {
    let $input = $(this);
    
    // Damos un pequeño retraso (200ms) para permitir que el clic en la lista 
    // se procese antes de borrar el texto
    setTimeout(function() {
        let idSeleccionado = $input.attr('data-id-seleccionado');
        
        // Si no hay un ID válido guardado, limpiamos el campo
        if (!idSeleccionado) {
            $input.val('');
        }
    }, 200);
});

   // Acción al hacer clic en un empleado de la lista
    $(document).on('click', '.item-empleado', function() {
    //  let $item = $(this);
      
             let nombre = $(this).data('nombre');
        let idInterno = $(this).data('id');
       let turno = $(this).data('turno');
    let minDia =  $(this).data('tiempo');
        
        let $inputDestino = $('#lista-empleados').data('input-activo');
    let $fila = $inputDestino.closest('tr');

      // 1. Asignamos nombre e ID al input
    $inputDestino.val(nombre).attr('data-id-seleccionado', idInterno);
      
 //  $fila.find('td:eq(2)').text(turno);  // Columna Turno
    $fila.find('td:eq(2)').text(minDia); // Columna Min/dia
        lista.hide().empty();
    });

    // Ocultar lista si se hace clic fuera
    $(document).click(function(e) {
       if (!lista.is(e.target) && lista.has(e.target).length === 0) {
            lista.hide();
        }
    });

  
// $(document).on('click', 'tr.fila-con-historial', function() {
  $(document).on('click', 'td.fila-con-historial', function() {
     var $td = $(this)
    var $filaPrincipal = $(this).closest("tr");
    var otId = $filaPrincipal.attr('data-ot-id');
    var opId = $filaPrincipal.attr('data-operacion-id');

    // Buscar todas las filas hijas que corresponden a esta combinación
    var $filasHijas = $('#cuerpoTabla').find(`tr.fila-desplegable[data-target-ot="${otId}"][data-target-op="${opId}"]`);

    if ($filaPrincipal.hasClass('abierto')) {
        // Cierre con animación hacia arriba
        $filasHijas.find('.slide-wrapper').slideUp(300, function() {
            $filasHijas.addClass('d-none'); // Ocultar fila contenedora al terminar la animación
        });
        $filaPrincipal.removeClass('abierto');
    } else {
        // Apertura con animación hacia abajo
        $filasHijas.removeClass('d-none'); // Mostrar contenedores tr primero
        $filasHijas.find('.slide-wrapper').slideDown(300);
        $filaPrincipal.addClass('abierto');
    }
});
  

  let filaTMActual = null;

$(document).on('click', '.addtm', function(){

    let motivo = $(this).attr('data-motivo');
    let duracion = $(this).attr('data-duracion');

    filaTMActual = $(this).closest('tr');

    $('#motivoTM').val(motivo);
    $('#duracionTM').val(duracion);

    $('#modalTiempoM').show();
});
  
  $('#cancelarTM').on('click', function(){
    $('#modalTiempoM').hide();
});
  
  $('#guardarTM').on('click', function(){

    let motivo = $('#motivoTM').val();
    let duracion = $('#duracionTM').val();

    if(!motivo){
        alert('Seleccione un motivo');
        return;
    }

    if(!duracion || parseInt(duracion) <= 0){
        alert('Ingrese una duración válida');
        return;
    }

    let idDetalle = filaTMActual.attr('data-detalle-id');

    console.log({
        idDetalle,
        motivo,
        duracion
    });

    

  
  
    var obj = {
        idDetalle:idDetalle,
        motivo:motivo,
        duracion:duracion,
        opcion:'addTiempoM'
    };

    var response =  SendtoBackend(obj,'setbihorarioDetalle')
        response().then((response) => {
                    console.log(response)
                   if(response.Response)
                   {
                     var information=response.Response 
                     
                     
                     if(information==idDetalle){
                        let $fila = $("#cuerpoTabla").find("tr[data-detalle-id='"+idDetalle+"']");
                       let $btn = $fila.find(".addtm");
                       $btn
        .removeClass("btn-outline-secondary")
        .addClass("btn-outline-warning")
        .text("👁 Ver TM");
                      $btn.attr("data-motivo", $("#motivoTM").val());
                      $btn.attr("data-duracion", $("#duracionTM").val());
                     
                   }
                     
                   }
                   else{
                     alert("fallo")
                   }
                     
                   
          $("#loading,#backfond").hide()
     });
    

    $('#modalTiempoM').hide();
});



};

function forzarSiguienteBihorario(obj) {
  var bihoAct= $("#noBiho").attr('noact')
  obj.bihoAct=bihoAct
  var nextbiho=parseInt(bihoAct)+1

                 var response = SendtoBackend(obj,'setbihorarioDetalle')
                 response().then((response) => {
                    console.log(response)
                   if(response.Response)
                   {
                     var informacion=response.Response
                     console.log('informacion',informacion)
                     $("#noBiho").attr('noact',nextbiho)
                       $("#noBiho").html("📋 BIHORARIO <strong>No."+nextbiho+"</strong>")
                   //  alert(informacion.response)
                     
                   }else{
                        $('#buscarOT').val("");                       
                     alert("Fallo")
                   }
          $("#searchTrasaction").val("")
          $("#loading,#backfond").hide()
     });

  
  
  
  
}

function GetRalacionadas(OT) {

    const obj = {
        OTValidar: OT
    };

    return SendtoBackend(obj, 'GetRalacionadas')()
        .then(function(response){

            let bandera = false;

            if(response.Response){

                const information = response.Response.OTRelacionadas;

                for(let i=0;i<information.length;i++){

                    const existe = $(`tr[data-ot-id="${information[i]}"]`);

                    if(existe.length > 0){
                        bandera = true;
                        break;
                    }
                }
            }

            $("#loading,#backfond").hide();

            return bandera;
        });
}
  function GuardarFila(linea) {
        let datosParaGuardar = [];

           
        // let $fila = $(this);
         let $fila = linea;
            let $inputEmpleado = $fila.find('.nombre-usuario');
          let $imputEstandar = $fila.find('.estandar-operacion').val();
        let $tiempo = $fila.find('.TiempoOP').text();

      let idSupervisor = $('#supervisor').attr("idsupervisor");
       let QtyOT = $fila.find('.qtyOt').text();

    var tiempoRequerido=parseFloat(QtyOT)*parseFloat($tiempo)
    
    var TotalBihorarios=tiempoRequerido/parseFloat($imputEstandar)
    if(TotalBihorarios>5){
      TotalBihorarios=5
    }else{
      TotalBihorarios=Math.ceil(TotalBihorarios);
    }
    var PZXbiohorario=parseFloat($imputEstandar/parseFloat($tiempo)  )
    PZXbiohorario=Math.floor(PZXbiohorario)
    
   // var TotalXbihorario=

            // Extraemos los valores requeridos
            let filaData = {
                fecha: $fila.find('td:eq(5)').text(), // Primera columna
                idEmpleado: $inputEmpleado.attr('data-id-seleccionado') || null,
                qtyEstandar: $imputEstandar,
                idOT: $fila.attr('data-ot-id'),
                idOperacion: $fila.attr('data-operacion-id'),
                seguimiento: $fila.attr('data-seguimiento-id'),
                estatus: $fila.attr('data-estatus'),
                tiempo:$tiempo,
                TotalBihorarios:TotalBihorarios,
                tiempoRequerido:tiempoRequerido,
              PZXbiohorario:PZXbiohorario,
              pzOT:QtyOT,
              idSupervisor:idSupervisor,
              idUnico1:idUnico1
            };

            // Solo agregamos si tiene un empleado asignado (opcional)
            if (filaData.idEmpleado) {
                datosParaGuardar.push(filaData);
            }
     
        console.log("Datos capturados:", datosParaGuardar);
        
        // Aquí podrías enviar 'datosParaGuardar' a tu Suitelet vía POST
        if (datosParaGuardar.length === 0) {          
            alert("No hay empleados asignados para guardar.");
        } else {
        var obj={
         'datosParaGuardar':datosParaGuardar,
         'bihorarioAct': $("#noBiho").attr('noact')||0,
          'supervisor': $('#supervisor').attr("idsupervisor")
       }
        var response = SendtoBackend(obj,'setParentInformation')
             response().then((response) => {
                    console.log(response)
                   if(response.Response){
                     var information=response.Response
                     cargarRegistrosAlmacenadosConEfecto(information.bihorario,null,'Asignar')
                     //limpiamos
                           $fila.removeClass("fila-encontrada");
     $fila.removeAttr('style'); 
      $fila.attr("data-seguimiento-id","");
  

        // Limpiamos el input del nombre en la fila clonada
      const $inputClonado =$fila.find(".nombre-usuario");      
       $inputClonado.val("");
       $inputClonado.attr("data-id-seleccionado","");
      $inputClonado.prop('readonly', false);
      $inputClonado.prop('disabled', false);
        $inputClonado.removeAttr('style');

   
                    console.log('information',information)                    
                   }else{
                     
                     alert("fallo")
                   }
          $("#loading,#backfond").hide()
          });
          
        }
  
    
    
  }
    // Función para agregar filas a la tabla
    function agregarFilas(data) {
      console.log(data)
        let htmlRows = "";

          // 1. Convertimos el objeto en un array y lo recorremos
    Object.values(data).forEach(ot => {
      
      var id_ot=ot.id_ot
      var name_ot=ot.name_ot
      var item_ot=ot.itemtext_OT
      var qty_ot=ot.qty_ot
      var item_OT=ot.item_OT
        
        // 2. Recorremos el arreglo de "Operaciones" de cada OT
      var otCurr=""
        ot.Operaciones.forEach(op => {
            
   

          var fechaAC=new Date()
            var dia=fechaAC.getDate()
          var mes =fechaAC.getMonth()+1
           var anio =fechaAC.getFullYear()
            var fechaCom=dia+"/"+mes+"/"+anio
          if(id_ot!=otCurr){
             htmlRows += `<tr class="fila-separador grupo-operacion"><td colspan='11'>${name_ot} ${item_ot}</td></tr>`
          }
          ////////////
         /*     htmlRows += `
    <tr class="grupo-operacion">
        <td colspan="11">
            <span class="titulo-operacion">
                ${op.dec_operacion}
            </span>

            <span class="badge-cantidad">
                CANT. OT: ${qty_ot}
            </span>
        </td>
    </tr>
    `;*/
////////////////////

                      htmlRows += `
              <tr
                data-ot-id="${id_ot}" 
                data-operacion-id="${op.id_operacion}">
                 <td>${op.dec_operacion}</td>
              
             <!--   <td>modulo</td>-->
               <!--   <td>turno</td>-->
                <td><input type="text" class="form-control form-control-lg nombre-usuario" placeholder="Asignar..."></td>
                <td>minDia</td>
                <td>${name_ot}</td>
                <td class="qtyOt">${qty_ot}</td>
                 <td>${fechaCom}</td>
                <td class="TiempoOP">${op.tiempo_operacion}</td>
               <td><input type="text" class="form-control form-control-lg estandar-operacion" placeholder="Cantidad" value="112" readonly style="background-color: #e9ecef; cursor: not-allowed;"></td>
               
                <td>
                    <button class="btn btn-outline-secondary btn-clonar">Asignar</button>
                </td>
            </tr>`;
          
             $("#cuerpoTabla").append(htmlRows);
            htmlRows=""
          otCurr=id_ot
          
        });
    });
}



    function obtenerDatosTabla() {
        let datosFinales = [];
        $("#cuerpoTabla tr").each(function() {
            const fila = $(this);
            datosFinales.push({
                otId: fila.data("ot-id"),
                opId: fila.data("operacion-id"),
                nombre: fila.find(".nombre-usuario").val()
            });
        });
        console.log(datosFinales);
    }

function RelacionarFilas(DatosArray) {
  for (var index = 0; index < DatosArray.length; index++) {
    var Datos=DatosArray[index]
    Datos=Datos.split("_")
    var IdSeguimiento=Datos[0]
    var idempleado=Datos[1]
    var idOT=Datos[2]
    var idOperacion=Datos[3]
    $('input[data-id-seleccionado="' + idempleado + '"]').each(function() {
    var $input = $(this);
    var $tr = $input.closest('tr');

    // Validamos que el TR padre tenga EXACTAMENTE los otros dos valores
    if ($tr.attr('data-ot-id') === idOT && $tr.attr('data-operacion-id') === idOperacion) {
        
        // Si coincide, agregamos el nuevo atributo
        $tr.attr('data-seguimiento-id',IdSeguimiento);
        $tr.addClass('fila-encontrada');
        
        console.log("Fila encontrada y marcada para OT:", idOT);

      $tr.css({
        'background-color': '#fff3cd', // Un amarillo tipo "highlight"
        'transition': 'all 0.3s ease',
        'border': '2px solid #ffc107'
    });
       $tr.find('input.nombre-usuario').prop('readonly', true);
      // Opcional: Cambiar el cursor para indicar que no es editable
    $tr.find('input.nombre-usuario').css({
        'background-color': '#e9ecef',
        'cursor': 'not-allowed'
    });
      

    // Animación opcional para llamar la atención (flash)
    $tr.fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
      
    }
});
    
    
    
    
  }
  
}
function calcularPorcentajeGlobal(otId, opId,idpadre) {
  

  console.log(otId,opId,idpadre)
    var totalAcciones = 0;
    var totalDetalle = 0;

    // Buscar todas las filas de detalle asociadas a este grupo
    var $filasDetalle = $('#cuerpoTabla').find(`tr.fila-detalle-biho[data-target-ot="${otId}"][data-target-op="${opId}"][padre="${idpadre}"]`);

    $filasDetalle.each(function() {
        var $fila = $(this);
        totalAcciones += parseFloat($fila.find('.qty-acciones').text()) || 0;
        totalDetalle += parseFloat($fila.find('.qty-detalle').text()) || 0;
   // console.log('totalAcciones',totalAcciones)
       //  console.log('totalDetalle',totalDetalle)
    });

    // Calcular promedio ponderado global
    var porcentajeTotal = totalAcciones > 0 ? (totalDetalle / totalAcciones) * 100 : 0;
  //console.log('porcentajeTotal:'+idpadre,porcentajeTotal)
     var $contenedorPorcentajePadre = $('#cuerpoTabla').find(`tr.fila-desplegable[data-ot-id="${otId}"][data-operacion-id="${opId}"][data-seguimiento-id="${idpadre}"]`);

  $contenedorPorcentajePadre.find('td:last').html('<div class="slide-wrapper" style="">'+porcentajeTotal.toFixed(1) + '% </div>');


    return porcentajeTotal;
}

function cargarRegistrosAlmacenadosConEfecto(bihorarios,tienenext,btn) {
   // var bihorarios = data.Response.Bihorario;
//  console.log(bihorarios)
  var MayorBihorario=0;
    Object.keys(bihorarios).forEach(function(key) {
        var biho = bihorarios[key];
      var idBiorario=biho.id_bihopa
    
       var encontrado=$("#cuerpoTabla").find("tr[data-seguimiento-id='"+idBiorario+"']").first()

      if(encontrado.length==0){
          var $filaBase = $('#cuerpoTabla').find('tr[data-ot-id="' + biho.ot_bihopa + '"][data-operacion-id="' + biho.operacion_bihopa + '"]').first();
      // console.log($filaBase)
      if ($filaBase.length > 0) {
            // Indicar visualmente que la fila original tiene datos ocultos cargados
            $filaBase.addClass('fila-con-historial').attr('title', 'Clic para ver registros guardados');
        
            $filaBase.find("td").first().attr('title', 'Clic para ver registros guardados').addClass('fila-con-historial')
            // 1. Clonar fila base para el registro Bihorario
            var $nuevaFilaBiho = $filaBase.clone();
        var tiempo=$nuevaFilaBiho.find('.TiempoOP').text()
         console.log('tiempo',tiempo)
        
            $nuevaFilaBiho.removeClass('fila-con-historial').addClass('fila-desplegable fila-encontrada d-none');
            $nuevaFilaBiho.attr('data-target-ot', biho.ot_bihopa).attr('data-target-op', biho.operacion_bihopa);
            $nuevaFilaBiho.attr('data-seguimiento-id', biho.id_bihopa);
         $nuevaFilaBiho.removeAttr('title');
        
          $nuevaFilaBiho.attr('total_bihopa', biho.total_bihopa);
          $nuevaFilaBiho.attr('tiempo_bihopa', biho.tiempo_bihopa);
          $nuevaFilaBiho.attr('pzxbiho_bihopa', biho.pzxbiho_bihopa);
          $nuevaFilaBiho.attr('pzot_bihopa', biho.pzot_bihopa);
          //  $nuevaFilaBiho.find('button').removeClass('btn-clonar').addClass('btn-agregar').html('+ Horario');

           $nuevaFilaBiho.find('.btn-clonar').removeClass('btn-clonar').addClass('btn-terminarOp').text('Terminar Operacion')
     
        
        var $imputEstandar=  $nuevaFilaBiho.find('.estandar-operacion')
      
        var AccionesXTiempo=parseInt( biho.estandar_bihopa)/parseFloat(tiempo)
        AccionesXTiempo=AccionesXTiempo.toFixed(0)

       $imputEstandar.css({
        'background-color': '#e9ecef',
        'cursor': 'not-allowed'
    }).prop('readonly', true).val( biho.estandar_bihopa);
         
         
            var $inputEmpleado = $nuevaFilaBiho.find('.nombre-usuario');
            $inputEmpleado.val(biho.empleadoText_bihoPa).attr('data-id-seleccionado', biho.empleadoid_bihopa).prop('readonly', true);
            $nuevaFilaBiho.find('td:eq(5)').text(biho.fecha_bihopa);
        
           $nuevaFilaBiho.find('input.nombre-usuario').css({
        'background-color': '#e9ecef',
        'cursor': 'not-allowed'
    });
        

            // Envolver contenido de las celdas de Bihorario en un div oculto para la animación
            $nuevaFilaBiho.find('td').wrapInner('<div class="slide-wrapper" style="display:block;" />');
          var grupoEmpleado = `
<tr class="grupo-empleado"
    data-grupo="${biho.id_bihopa}">
    <td colspan="11">

        <span class="grupo-titulo">
            👤 ${biho.empleadoText_bihoPa}
        </span>

        <span class="grupo-op">
            ${$filaBase.find('td:eq(7)').text()}
        </span>

    </td>
</tr>
`;
        
        
        // $filaBase.after($nuevaFilaBiho);
        $filaBase.after($nuevaFilaBiho);
$nuevaFilaBiho.before(grupoEmpleado);
        encontrado=$nuevaFilaBiho
  }
         }
    
     
            // 2. Procesar fila de DetalleBiho si existe
      var BihoracionInProgress=[]
     if (biho.DetalleBiho && biho.DetalleBiho.length > 0) {
                var detallesInvertidos = biho.DetalleBiho.slice().reverse();
              
               detallesInvertidos.forEach(function(detalle) {
                  console.log(detalle)
                    var hora = detalle.horario_bihode ? detalle.horario_bihode  : 'N/A';
                    var cantidad = detalle.qty_bihode !== null ? detalle.qty_bihode : 0;
                   var idDetalle = detalle.id_bihode 
                   var estatus = detalle.estatus_bihode 
                   var esperado = detalle.esperado_bihode 
                  var porcent=(cantidad/AccionesXTiempo)*100
                  var encontradoDetalle=$("#cuerpoTabla").find("tr[data-detalle-id='"+idDetalle+"']").first()

                   var NoBiho=detalle.no_bihode
                  var motivoTM=detalle.motibotm
                  var totTM=detalle.tottm
 
                //console.log(encontradoDetalle)
                 if(!idDetalle){
                   return
                 }
                 

                  porcent=porcent.toFixed(0)

                 if(MayorBihorario<NoBiho){
                   MayorBihorario=NoBiho
                 }
                             $("#noBiho").attr("noact",MayorBihorario)
                   $("#noBiho").html("📋 BIHORARIO <strong>No."+MayorBihorario+"</strong>")

                 
                 if(encontradoDetalle.length==0 && estatus=='F')
                 {
                   if(motivoTM){
                     var BtnTM=`<button data-motivo="${motivoTM}" data-duracion="${totTM}" class="btn btn-outline-warning addtm"> 👁 Ver TM</button>`
                   }else{
                      var BtnTM=`<button class="btn btn-outline-secondary addtm"> + Tiempo M</button>`
                   }

                   
                  

                   BihoracionInProgress.push(idBiorario)
                   console.log('detalle',detalle)
    
                                var filaDetalleHtml = `
                        <tr class="table-light fila-desplegable fila-detalle-biho d-none" padre="${biho.id_bihopa}" data-target-ot="${biho.ot_bihopa}" data-target-op="${biho.operacion_bihopa}" data-detalle-id="${idDetalle}" >
                            <td><div class="slide-wrapper" style="display:block;"></div></td>
                            <td colspan="1" class="text-end text-muted"><div class="slide-wrapper" style="display:block;"><strong>Horario:</strong></div></td>
                            
                            <td colspan="1"><div class="slide-wrapper" style="display:block;"><span class="badge bg-secondary">${hora}</span></div></td>

                            <td colspan="1"><div class="slide-wrapper" style="display:block;"><strong> <span class='qty-acciones'>${esperado}</span></strong>  </div></td>
                           
                            <td colspan="1"><div class="slide-wrapper" style="display:block;">Cantidad:<strong> <span class='qty-detalle'>${cantidad}</span></strong>  Pz</div></td>
                           
                            <td colspan="2"><div class="slide-wrapper" style="display:block;"><input type="text" class="form-control form-control-lg sumar-detalle" placeholder="Sumar"></div></td>
                            
                             <td colspan="1"><div class="" style="display:none;"><span class="porcenDetalle">${porcent} %</span></div></td>
                          
                              <td colspan="3"><div class="slide-wrapper" style="display:none;">${BtnTM} </div></td>
                          
                        </tr>
                    `;

                   
                   if( $nuevaFilaBiho){
                       $nuevaFilaBiho.after(filaDetalleHtml);
                   }else{
                       encontrado.after(filaDetalleHtml);

                 
                    
                   }
                }else{
                   if(btn!="Asignar"){
                      encontradoDetalle.remove()
                   }
                  
                  
                 
                   
                   
                } 

       
                    
                });
                 console.log('fin')
            }

      const IsProgress = BihoracionInProgress.find((element) => element == idBiorario);
       if(tienenext && !IsProgress){
                       if(!tienenext[idBiorario]){
   var nuevaLeyenda = `
    <div class="slide-wrapper" style="
       position: relative; 
        top: -5px; 
        left: 5px; 
        background-color: #ffc107; 
        color: #000; 
        padding: 4px 10px; 
        border-radius: 4px; 
        font-weight: bold; 
        font-size: 10px; 
        box-shadow: 0px 4px 6px rgba(0,0,0,0.15);
        display: inline-block;
        pointer-events: auto;
        z-index: 5;
    ">
        ⚠️ TERMINADA
    </div>
`;
                   //  encontrado.css('position', 'relative');
                     encontrado.find("td:first").html(nuevaLeyenda);
                           encontrado.find(".btn-terminarOp").remove();
                     
                    
                   }
                   }    
    });
}

main();
$('#btnLoadBiho').trigger('click');
