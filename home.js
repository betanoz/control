// ===== REEMPLAZA ESTA FUNCIÓN COMPLETA EN TU home.js =====
function abrirPanelLateral(biho, $filaEmpleado) {
    console.log("--- PROCESANDO CAPTURA DINÁMICA ---");
    
    // 1. Mostrar visualmente el panel lateral de inmediato al frente de todo
    var $drawer = $('#drawerDetalleEmpleado');
    if ($drawer.length > 0) {
        $drawer.css({
            'display': 'flex',
            'flex-direction': 'column',
            'position': 'fixed',
            'top': '0',
            'right': '0',
            'width': $(window).width() <= 576 ? '100vw' : '450px',
            'height': '100vh',
            'background-color': '#ffffff',
            'box-shadow': '-5px 0 25px rgba(0,0,0,0.3)',
            'z-index': '99999999'
        }).addClass('abierto');
    }

    // Mostrar el fondo oscuro transparente de fondo
    $('#backfond').show().css({
        'position': 'fixed', 'top': '0', 'left': '0',
        'width': '100vw', 'height': '100vh',
        'background': 'rgba(0,0,0,0.4)', 'z-index': '9999999'
    });

    // 2. Extraer metadatos básicos del empleado clickeado
    var nombreEmpleado = $filaEmpleado.find('.nombre-usuario').val() || (biho ? (biho.empleadoText_bihoPa || biho.empleadotext_bihopa) : 'Empleado');
    var operacionTexto = $filaEmpleado.find('td:eq(0)').text() || (biho ? biho.operacion_bihopa : 'Operación');
    var otTexto = $filaEmpleado.find('td:eq(3)').text() || (biho ? biho.ot_bihopa : 'OT');
    var estandarBiho = biho ? parseFloat(biho.estandar_bihopa || biho.estandar_bihoPa || 112) : 112;

    $('#drawerTituloEmpleado').html(`👤 ${nombreEmpleado}`);

    // RASTREO: Buscamos todas las subfilas de los bloques horarios vinculados abajo del empleado clickeado
    var bloquesAProcesar = [];
    var $posiblesSubfilas = $filaEmpleado.nextAll('tr');
    
    $posiblesSubfilas.each(function() {
        var $subFila = $(this);
        
        // Detener la búsqueda si nos topamos con otra fila de empleado principal
        if ($subFila.hasClass('fila-encontrada') || $subFila.attr('data-ot-id') || $subFila.hasClass('fila-con-historial')) {
            return false; 
        }

        if ($subFila.hasClass('fila-detalle-biho') || $subFila.find('.sumar-detalle').length > 0 || $subFila.find('.qty-detalle').length > 0) {
            var idDet = $subFila.attr('data-detalle-id') || $subFila.find('.sumar-detalle').attr('data-id') || $subFila.find('input').attr('data-id');
            var cantText = $subFila.find('.qty-detalle').text() || $subFila.find('.sumar-detalle').val() || '0';
            var cant = parseFloat(cantText);
            if (isNaN(cant)) cant = 0;

            // Limpieza y formateo del texto del bloque horario
            var textoHorario = $subFila.text().replace(/[\n\t]/g, ' ').replace(/\s+/g, ' ').trim();
            if (textoHorario.toLowerCase().includes('horario:')) {
                var partes = textoHorario.split(/horario:/i);
                textoHorario = 'Bloque Horario: ' + partes[1].trim().split(' ')[0];
            } else {
                textoHorario = 'Bloque Activo #' + (bloquesAProcesar.length + 1);
            }

            bloquesAProcesar.push({
                id: idDet || 'temp_' + bloquesAProcesar.length,
                horario: textoHorario,
                cantidad: cant,
                esperado: 51
            });
        }
    });

    // Respaldo por objeto directo de base de datos
    if (bloquesAProcesar.length === 0 && biho && biho.DetalleBiho && biho.DetalleBiho.length > 0) {
        biho.DetalleBiho.forEach(function(d) {
            var idDetalle = d.id_bihode || d.id_biho_det || d.id_bihoDe;
            if(!idDetalle) return;
            var cantRaw = d.qty_bihoDe !== undefined ? d.qty_bihoDe : (d.qty_bihode !== undefined ? d.qty_bihode : 0);
            var cant = parseFloat(cantRaw);
            
            bloquesAProcesar.push({
                id: idDetalle,
                horario: d.horario_bihode || d.horario_bihoDe || 'Bloque Horario',
                cantidad: isNaN(cant) ? 0 : cant,
                esperado: parseFloat(d.esperado_bihode || d.esperado_bihoDe || 51) || 51
            });
        });
    }

    // 3. USO DEL TEMPORIZADOR ASÍNCRONO PARA INYECTAR LOS DATOS SEGUROS
    setTimeout(function() {
        var elContenedorBody = document.getElementById("drawerContenidoBody");
        if (!elContenedorBody) {
            console.error("No se encontró el cuerpo del panel en la pantalla");
            return;
        }

        // Vaciamos el contenedor e inyectamos la tarjeta informativa fija
        var htmlContenido = `
            <div style="background: #eef2f6; padding: 12px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #1e3a5f;">
                <p style="margin: 0; font-size: 14px; color: #1e293b;"><strong>Orden de Trabajo:</strong> ${otTexto}</p>
                <p style="margin: 4px 0 0 0; font-size: 14px; color: #1e293b;"><strong>Operación:</strong> ${operacionTexto}</p>
                <p style="margin: 4px 0 0 0; font-size: 14px; color: #1e293b;"><strong>Capacidad Estándar:</strong> ${estandarBiho} pzs</p>
            </div>
        `;

        // Generamos dinámicamente las tarjetas de cada bloque de horario detectado
        if (bloquesAProcesar.length > 0) {
            bloquesAProcesar.forEach(function(bloque) {
                var porcent = bloque.esperado > 0 ? (bloque.cantidad / bloque.esperado) * 100 : 0;
                porcent = Math.round(porcent);

                htmlContenido += `
                    <div class="card-horario-detalle" data-detalle-id="${bloque.id}" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:15px; margin-bottom:12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color:#0f172a; font-weight:600;"><strong>${bloque.horario}</strong></span>
                            <span class="badge" style="font-size: 12px; background-color: #007bff; color:#fff; padding: 4px 8px; border-radius: 4px;">Esperado: ${bloque.esperado} pzs</span>
                        </div>
                        
                        <div class="progress" style="height: 6px; margin-bottom: 12px; background-color: #e9ecef; border-radius: 4px; overflow: hidden; display:flex;">
                            <div class="progress-bar bg-success" role="progressbar" style="width: ${porcent}%; background-color: #28a745; height: 100%;" aria-valuenow="${porcent}" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>

                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                            <span style="font-size: 13px; color: #64748b;"> Avance Actual: <strong style="color: #0f172a; font-size: 14px;">${bloque.cantidad} pzs</strong> (${porcent}%)</span>
                       <input type="number" class="form-control form-control-sm sumar-drawer-input-final" placeholder="+ Cantidad" style="width: 100px; text-align: center; border: 1px solid #ced4da; border-radius: 4px; padding: 2px 5px;">
                      </div>
                    </div>
                `;
            });
        } else {
            htmlContenido += `
                <div style="text-align: center; color: #64748b; margin-top: 30px; padding: 20px; background:#fff; border:1px dashed #ced4da; border-radius:8px;">
                    <p style="font-size: 15px; margin:0;">⚠️ No se encontraron bloques horarios activos debajo de este empleado en la tabla.</p>
                </div>
            `;
        }

        // Pintamos el contenido de forma definitiva
        elContenedorBody.innerHTML = htmlContenido;
        console.log("--- CONTENIDO INYECTADO AL COPIAR EL DOM ---");
    }, 50);

    return true;
}




// Eventos de cierre del panel derecho
$(document).ready(function() {
    $('#btnCerrarDrawer, #backfond').on('click', function() {
        $('#drawerDetalleEmpleado').removeClass('abierto');
        $('#backfond').fadeOut(200);
    });
});





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














  $(document).on('click', 'tr.fila-desplegable.fila-encontrada', function(e) {
    if ($(e.target).is('input, button, select')) return;
    const $fila = $(this);
    $('#drawerTituloEmpleado').html(`👤 ${$fila.find('.nombre-usuario').val()}`);
    const $contenedorBody = $('#drawerContenidoBody').empty();
    
    // ... [Lógica de renderizado de datos] ...
    
    $('#backfond').show();
    $('#drawerDetalleEmpleado').addClass('abierto');
});
// Cierre del panel
$('#btnCerrarDrawer, #backfond').on('click', function() {
    $('#drawerDetalleEmpleado').removeClass('abierto');
    $('#backfond').hide();
});


  $(document).on('change', '.sumar-detalle-drawer-input', function() {
    var $input = $(this);
    var $card = $input.closest('.card-horario-detalle');
    var idDetalle = $card.attr('data-detalle-id');
    var qtyASumar = $input.val();
    
    if (!qtyASumar || parseInt(qtyASumar) <= 0) return;

    // Buscamos la fila oculta original en la tabla para heredar sus datos de envío
    var $filaEquivalente = $(`tr.fila-detalle-biho[data-detalle-id="${idDetalle}"]`);
    
    // Si la fila existe en la tabla original, le transferimos el valor e invocamos tu evento change existente
    if ($filaEquivalente.length > 0) {
        $filaEquivalente.find('.sumar-detalle').val(qtyASumar).trigger('change');
        $input.val(''); // Limpiamos el input del panel
    } else {
        alert("No se encontró el mapeo de la fila horaria en la tabla principal.");
    }
});


  // 4. Asegurar el enlace de guardado masivo cuando escriban en el panel
$(document).off('change', '.sumar-drawer-input-final').on('change', '.sumar-drawer-input-final', function() {
    var $input = $(this);
    var idDetalle = $input.closest('.card-horario-detalle').attr('data-detalle-id');
    var valorASumar = $input.val();
    
    if (!valorASumar || parseInt(valorASumar) <= 0) return;

    // Buscamos el input oculto original en el DOM de la tabla
    var $inputOriginal = $(`input.sumar-detalle[data-id="${idDetalle}"], input[data-id="${idDetalle}"].sumar-detalle`);
    if ($inputOriginal.length > 0) {
        $inputOriginal.val(valorASumar).trigger('change');
        $input.val(''); // Limpiar el panel tras enviar el dato
    } else {
        // Respaldo por si el elemento no tiene data-id explícito pero la fila coincide
        var $filaEquiv = $(`tr.fila-detalle-biho[data-detalle-id="${idDetalle}"]`);
        if($filaEquiv.length > 0) {
            $filaEquiv.find('input').val(valorASumar).trigger('change');
            $input.val('');
        }
    }
});
  

  
  





  
  


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
       console.log(NuevoValor)


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

// ===== REEMPLAZA ESTA FUNCIÓN COMPLETA EN TU home.js =====
// ===== REEMPLAZA ESTA FUNCIÓN COMPLETA EN TU home.js =====
function cargarRegistrosAlmacenadosConEfecto(bihorarios, tienenext, btn) {
    Object.keys(bihorarios).forEach(function(key) {
        var biho = bihorarios[key];
        var idBiorario = biho.id_bihopa;
        
        // 1. Buscamos la fila base de la operación original
        var $filaBase = $('#cuerpoTabla').find('tr[data-ot-id="' + biho.ot_bihopa + '"][data-operacion-id="' + biho.operacion_bihopa + '"]').first();
        var tiempo = parseFloat($filaBase.find('.TiempoOP').text()) || 1;
        var estandarBiho = parseFloat(biho.estandar_bihopa) || 112;
        var AccionesXTiempo = parseFloat((estandarBiho / tiempo).toFixed(0)) || 1;

        // 2. Aquí es donde NetSuite crea la fila real para el empleado asignado
        var $filaEmpleadoExistente = $("#cuerpoTabla").find("tr[data-seguimiento-id='" + idBiorario + "']");
        
        if ($filaEmpleadoExistente.length == 0 && $filaBase.length > 0) {
            var $nuevaFilaBiho = $filaBase.clone();
            $nuevaFilaBiho.removeClass('fila-con-historial').addClass('fila-desplegable fila-encontrada');
            $nuevaFilaBiho.attr('data-target-ot', biho.ot_bihopa).attr('data-target-op', biho.operacion_bihopa);
            $nuevaFilaBiho.attr('data-seguimiento-id', biho.id_bihopa);
            $nuevaFilaBiho.find('.total_biho').val(biho.total_bihopa);
            $nuevaFilaBiho.find('.tiempo_biho').val(biho.tiempo_bihopa);
            $nuevaFilaBiho.find('.estandar-biho').val(biho.estandar_bihopa);
            
            var $inputEmpleado = $nuevaFilaBiho.find('.nombre-usuario');
            $inputEmpleado.val(biho.empleadoText_bihoPa).attr('data-id-seleccionado', biho.empleadoid_bihopa);
            
            // Hacemos que la fila del empleado sea clickeable de forma elegante
            $nuevaFilaBiho.css({'cursor': 'pointer'}).attr('title', 'Clic para ver bloques horarios');
            $nuevaFilaBiho.off('click').on('click', function(e) {
                // Si hace clic en botones de la fila (como Terminar Operación), no abras el panel
                if ($(e.target).is('input, button, select')) return;
                abrirPanelLateral(biho, $(this));
            });

            $filaBase.after($nuevaFilaBiho);
        }
        else if ($filaEmpleadoExistente.length > 0) {
            // Si la fila ya existía, también le asignamos el evento de clic
            $filaEmpleadoExistente.css({'cursor': 'pointer'}).attr('title', 'Clic para ver bloques horarios');
            $filaEmpleadoExistente.off('click').on('click', function(e) {
                if ($(e.target).is('input, button, select')) return;
                abrirPanelLateral(biho, $(this));
            });
        }

        // 3. Procesamos los desgloses horarios (los bloques 1, 2, etc. con el botón sumar)
      // ===== REEMPLAZA ESTE BLOQUE INTERNO EN cargarRegistrosAlmacenadosConEfecto DE home.js =====
if (biho.DetalleBiho && biho.DetalleBiho.length > 0) {
    biho.DetalleBiho.forEach(function(detalle) {
        // Evaluamos todas las variantes de ID para asegurar que no se salte ningún bloque
        var idDetalleReal = detalle.id_bihode || detalle.id_biho_det || detalle.id_bihoDe;
        if (!idDetalleReal) return;
        
        var $filaDetalleOriginal = $('#cuerpoTabla').find('tr.fila-detalle-biho[data-detalle-id="' + idDetalleReal + '"]');
        
        if ($filaDetalleOriginal.length == 0) {
            // Mapeo ultra-seguro de las cantidades reales de tu base de datos (tolerante a mayúsculas)
            var cantidadRaw = detalle.qty_bihoDe !== undefined ? detalle.qty_bihoDe : (detalle.qty_bihode !== undefined ? detalle.qty_bihode : 0);
            var cantidad = cantidadRaw !== null ? parseFloat(cantidadRaw) : 0;
            if (isNaN(cantidad)) cantidad = 0;

            var esperadoRaw = detalle.esperado_bihode || detalle.esperado_bihoDe || AccionesXTiempo;
            var esperado = parseFloat(esperadoRaw);
            if (isNaN(esperado)) esperado = AccionesXTiempo;

            var horarioTexto = detalle.horario_bihode || detalle.horario_bihoDe || 'N/A';

            // VISIBLE PARA PRUEBAS: Quitamos 'd-none' y forzamos 'display: table-row;' con un fondo amarillo para identificarla
            var htmlFilaOculta = `
                <tr class="fila-detalle-biho" data-detalle-id="${idDetalleReal}" style="display: table-row; background-color: #fff3cd; border-left: 4px solid #ffc107;">
                    <td colspan="10" style="padding: 8px 20px;">
                        <span style="font-size: 12px; color: #856404; margin-right: 15px;">
                            <strong>[Fila Control Pruebas]</strong> Horario: ${horarioTexto} | Esperado: <span class="esperado-detalle">${esperado}</span> pzs
                        </span>
                        <input type="number" class="sumar-detalle" data-id="${idDetalleReal}" value="${cantidad}" style="width: 70px; text-align: center; border: 1px solid #ffc107; border-radius: 4px;">
                        <span style="margin-left: 10px; font-weight: bold; color: #856404;">Acumulado HTML: <span class="qty-detalle">${cantidad}</span> pzs</span>
                    </td>
                </tr>`;
            
            var $ultimaFila = $("#cuerpoTabla").find("tr[data-seguimiento-id='" + idBiorario + "']").last();
            if ($ultimaFila.length > 0) {
                $ultimaFila.after(htmlFilaOculta);
            } else {
                $filaBase.after(htmlFilaOculta);
            }
        } 
        else {
            // Si ya existía, la hacemos visible temporalmente para auditarla
            $filaDetalleOriginal.removeClass('d-none').css({'display': 'table-row', 'background-color': '#fff3cd'});
        }
    });
}

    });

    if (tienenext) {
        $("#btnsigBiho").attr('data-pag', tienenext).show();
    } else {
        $("#btnsigBiho").hide();
    }
    
    if (btn) {
        $(btn).prop('disabled', false).text('Siguiente BiHora');
    }
    $("#loading, #backfond").hide();
}


main();
$('#btnLoadBiho').trigger('click');
