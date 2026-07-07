/**
 *@author David Chávez Núñez
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
/* 
    Revisión 01/03/2023
    Descripción: Script principal de punto de venta
*/
define(["N/file", "N/url", "N/record", "N/runtime", "N/search","N/ui/serverWidget",'N/email','N/query','N/format'], (file, url, record, runtime, search,serverWidget,email,query,format) => {

    const homePageHtml = (
        globalCss,
      //  mainCss,
        mainJs,
        intimaLogo,
        backendUrl,
      currentUserObj
    ) => {
       var neewCli=currentUserObj.id
       var namesuper=currentUserObj.name

    
      if(currentUserObj.id=='437'){

        //   var neewCli=2368390
        //  var namesuper='SUPERVISOR REAL:'+neewCli
        //currentUserObj.id=5812
      }
      
        const home = /* html */ `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Bihorario</title>
                <style>

                      
 #lista-empleados {
    position: absolute;
    z-index: 2000 !important; /* Asegura quedar por encima de cualquier elemento de la tabla */
    max-height: 200px;        /* Limita la altura si hay muchos empleados */
    overflow-y: auto;         /* Agrega scroll interno si supera la altura máxima */
    box-shadow: 0px 4px 8px rgba(0,0,0,0.15); /* Mejora la visibilidad visual */
    background-color: #fff;
}



/* Fila de desglose horario (DetalleBiho) */
tr.fila-detalle-biho td {
    font-size: 0.85rem;
    padding-top: 4px !important;
    padding-bottom: 4px !important;
    background-color: #f8f9fa !important; /* Gris claro */
    color: #495057;
}


/* Fila principal interactiva */
tr.fila-con-historial {
    cursor: pointer;
    transition: background-color 0.2s ease;
}

tr.fila-con-historial:hover {
    background-color: #f1f3f5 !important;
}

/* Pequeño indicador de estado abierto / cerrado */
tr.fila-con-historial td:first-child::before {
    content: "📁 ";
    font-size: 0.9rem;
}

tr.fila-con-historial.abierto td:first-child::before {
    content: "📂 ";
}




/* Filas de detalle horario (Sub-filas desglosadas) */
tr.fila-detalle-biho td {
    background-color: #fdfdfd !important;
    font-size: 0.82rem;
    padding-top: 4px !important;
    padding-bottom: 4px !important;
    border-color: #f1f3f5;
}

/* Contenedor de animaciones interno */
.slide-wrapper {
    padding: 4px 0;
    display: flex;
    align-items: center;
    gap: 6px; /* Separa los textos de las etiquetas */
}

/* Botones de acción micro */
.btn {
    padding: 2px 8px;
    font-size: 0.75rem;
    border-radius: 4px;
    cursor:pointer;
}
/* Encabezado moderno */
#tablaOT thead th {
    background: linear-gradient(
        90deg,
        #1e3a5f,
        #2c5282
    );
    color:white;
}
/* Control de anchos de columna (Suma 100%) */
#tablaOT th:nth-child(1)  { width: 32%; }  /* Fecha */
#tablaOT th:nth-child(2)  { width: 20%; } /* Nombre */
#tablaOT th:nth-child(3)  { width: 5%; }  /* Min/dia */
#tablaOT th:nth-child(4)  { width: 10%; }  /* OT */
#tablaOT th:nth-child(5)  { width: 5%; }  /* Cant. OT */
#tablaOT th:nth-child(6)  { width: 8%; } /* Operación */
#tablaOT th:nth-child(7)  { width: 5%; }  /* Tiempo Ciclo */
#tablaOT th:nth-child(8) { width: 5%; }  /* Estandar */
#tablaOT th:nth-child(9) { width: 10%; }  /* Acciones */
/* Contenedor principal de la aplicación */
.pantalla-completa-container {
    width: 100vw;
    padding: 20px;
    background-color: #f8f9fa;
    box-sizing: border-box;
}

/* Contenedor responsivo de la tabla */
.tabla-responsiva-total {
    width: 100%;
    overflow-x: auto;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: 1px solid #dee2e6;
}

/* Forzar a la tabla a expandirse */
#tablaOT {
    width: 100% !important;
    margin-bottom: 0;
    table-layout: fixed; /* Mantiene las columnas alineadas entre filas padre e hijas */
}

/* Aplicar fuente Consolas a toda la tabla y sus componentes */
#tablaOT, 
#tablaOT input, 
#tablaOT button, 
#tablaOT span, 
#tablaOT select {
    font-family: 'Segoe UI', sans-serif !important;
}

/* Optimización de legibilidad para fuentes monoespaciadas */
#tablaOT {
    letter-spacing: -0.2px; /* Reduce el espaciado para que no se vea tan separada */
}

/* Hacer que los números resalten más (alineación perfecta) */
.qty-acciones, .qty-detalle, .porcenDetalle, .TiempoOP {
    font-weight: bold;
}
/* Fila separadora de OTs (Encabezado de sección) */
.fila-separador td {
  /*  background:#dbeafe !important;*/
    color:#1e40af;
    font-size:15px;
    font-weight:500;
    border-left:5px solid #2563eb;
    
    background:#eef5ff !important;

    border-top:2px solid #3b82f6 !important;

    border-bottom:1px solid #dbeafe !important;

    padding:0px 16px !important;
}

/* Fila de Historial / Seguimiento (Fila Verde) */
tr.fila-encontrada {
    background-color: #f4fbf7 !important; /* Verde ultra suave */
    border-left: 4px solid #198754;
}

tr.fila-encontrada td {
    color: #146c43;
}
/* 
body{
    background:#f4f7fb;
    font-family:'Segoe UI',sans-serif;
    margin:0;
    padding:20px;
}*/


.header-subtitle{
    margin-top:5px;
}



.table-card{
    background:white;
    border-radius:12px;
    overflow:hidden;
    box-shadow:0 4px 15px rgba(0,0,0,.08);
}

#tablaOT tbody tr:nth-child(even){
    background:#f8fafc;
}

#tablaOT tbody tr:hover{
    background:#eef6ff !important;
}

.nombre-usuario{
    border-radius:8px !important;
    height:38px !important;
    border:1px solid #cbd5e1 !important;
}


.titulo-operacion{
    font-size:15px;
    font-weight:700;
    color:#1d4ed8;
}

.badge-cantidad{
    float:right;

    background:#3b82f6;

    color:white;

    padding:4px 10px;

    border-radius:6px;

    font-size:12px;

    font-weight:600;
}

.separador-operacion td{
    height:12px;
    background:#ffffff;
    border-bottom:2px dashed #93c5fd;
}
.header-card{

    display:flex;

    justify-content:space-between;

    align-items:center;

    padding:16px 20px;

    background:linear-gradient(
        135deg,
        #1e3a5f,
        #2c5282
    );

    border-radius:12px;

    color:white;

    margin-bottom:15px;

    box-shadow:
        0 4px 12px rgba(0,0,0,.12);
}



.header-subtitle{
    font-size:14px;
    opacity:.9;
    margin-top:4px;
}



/* ===== ENCABEZADO ===== */

.header-container{
    background: linear-gradient(
        135deg,
        #1e3a5f,
        #2c5282
    );

    padding: 15px 20px;

    border-radius: 12px;

    margin-bottom: 15px;

    box-shadow: 0 4px 12px rgba(0,0,0,.12);

    color: white;
}

.header-title{
    font-size: 26px;
    font-weight: 700;
    margin-bottom: 5px;
}

.header-subtitle{
    font-size: 14px;
    opacity: .9;
}

/* ===== BUSCADOR ===== */

.toolbar-container{

    display:flex;

    align-items:center;

    gap:10px;

    flex-wrap:wrap;

    background:white;

    padding:12px 15px;

    border-radius:10px;

    box-shadow:0 2px 8px rgba(0,0,0,.08);

    margin-bottom:15px;
}

.toolbar-container label{
    font-weight:600;
    color:#334155;
}

#buscarOT{

    width:250px;

    height:38px;

    border:1px solid #cbd5e1;

    border-radius:8px;

    padding:0 12px;

    font-size:14px;

    transition:.2s;
}

#buscarOT:focus{

    outline:none;

    border-color:#2563eb;

    box-shadow:0 0 0 3px rgba(37,99,235,.15);
}

/* ===== BOTONES ===== */

#btnBuscar,
#btnsigBiho,
#btnLoadBiho{

    border:none;

    border-radius:8px;

    padding:8px 16px;

    font-size:14px;

    font-weight:600;

    cursor:pointer;

    transition:.2s;
}

#btnBuscar{
    background:#2563eb;
    color:white;
}

#btnBuscar:hover{
    background:#1d4ed8;
}

#btnsigBiho{
    background:#f59e0b;
    color:white;
}

#btnsigBiho:hover{
    background:#d97706;
}

#btnLoadBiho{
    background:#16a34a;
    color:white;
}

#btnLoadBiho:hover{
    background:#15803d;
}

/* ===== SUPERVISOR ===== */

#supervisor{

    font-weight:600;

    color:white;

    padding:0 10px;
}
#modalTiempoM{
    display:none;

    position:fixed;

    top:0;
    left:0;

    width:100vw;
    height:100vh;

    background:rgba(0,0,0,.45);

    z-index:99999;
}

.modal-tiempo-content{

    position:absolute;

    top:50%;
    left:50%;

    transform:translate(-50%,-50%);

    width:420px;

    background:#fff;

    border-radius:12px;

    padding:20px;

    box-shadow:
        0 15px 40px rgba(0,0,0,.25);
}

.modal-tiempo-content h3{
    margin-top:0;
    color:#1e3a5f;
}

.campo-modal{
    margin-bottom:15px;
}

.campo-modal label{
    display:block;
    margin-bottom:5px;
    font-weight:600;
}

.campo-modal select,
.campo-modal input{

    width:100%;

    padding:10px;

    border:1px solid #d1d5db;

    border-radius:6px;

    box-sizing:border-box;
}

.acciones-modal{

    display:flex;

    justify-content:flex-end;

    gap:10px;

    margin-top:20px;
}

#cancelarTM{

    background:#e5e7eb;

    border:none;

    padding:8px 14px;

    border-radius:6px;

    cursor:pointer;
}

#guardarTM{

    background:#16a34a;

    color:white;

    border:none;

    padding:8px 14px;

    border-radius:6px;

    cursor:pointer;
}

#tablaOT td,
#tablaOT th{
    padding:2px 8px;
    vertical-align:middle;
}













/* ===== ESTILOS DEL PANEL LATERAL DETALLE ===== */
.drawer-detalle {
    position: fixed; top: 0; right: -100%; width: 450px; height: 100vh;
    background-color: #ffffff; box-shadow: -5px 0 25px rgba(0, 0, 0, 0.15);
    z-index: 100000; transition: right 0.3s ease-in-out;
    display: flex; flex-direction: column;
}
.drawer-detalle.abierto { right: 0; }
.drawer-header {
    background: linear-gradient(135deg, #1e3a5f, #2c5282);
    color: #ffffff; padding: 16px 20px;
    display: flex; justify-content: space-between; align-items: center;
}
.drawer-body { padding: 20px; overflow-y: auto; flex-grow: 1; background-color: #f8fafc; }
.card-horario-detalle {
    background: #ffffff; border: 1px solid #e2e8f0;
    border-radius: 8px; padding: 15px; margin-bottom: 12px;
}
@media (max-width: 576px) { .drawer-detalle { width: 100vw; right: -100vw; } }

















                 </style>
            
    
                
                <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.0/jquery.min.js"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.0/jquery.js"></script>
                 <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">     
           </head>


           
<body>

           <div id="modalTiempoM" class="modal-tiempo" style="display:none;">
    <div class="modal-tiempo-content">

        <h3>Registrar Tiempo Muerto</h3>

        <div class="campo-modal">
            <label>Motivo</label>

            <select id="motivoTM">
                <option value="">Seleccionar...</option>
                <option value="Ajuste de Maquina">Ajuste de Máquina</option>
                <option value="Paro por falla Maquinaría">Paro por falla Maquinaría</option>
                <option value="Paro por falla Máquina Costura">Paro por falla Máquina Costura</option>
                <option value="Rechazo de Calidad">Rechazo de Calidad</option>
                <option value="Falta de Insumos">Falta de Insumos</option>
            </select>
        </div>

        <div class="campo-modal">
            <label>Duración (minutos)</label>

            <input
                type="number"
                id="duracionTM"
                min="1"
                placeholder="Ej. 15"
            >
        </div>

        <div class="acciones-modal">
            <button id="cancelarTM">
                Cancelar
            </button>

            <button id="guardarTM">
                Guardar
            </button>
        </div>

    </div>
</div>

<div class="header-container">

    <div class="header-title" id="noBiho" noAct="0">
        📋 BIHORARIO No 0
    </div>

    <div class="header-subtitle">
        Supervisor:
        <span id="supervisor"
              idSupervisor="${neewCli}">
            ${namesuper}
        </span>
    </div>

</div>

<div class="toolbar-container">

    <label for="buscarOT">
        Orden de Trabajo
    </label>

    <input
        type="text"
        id="buscarOT"
        placeholder="Ej: OT-111111"
    >

    <button id="btnBuscar">
        Buscar
    </button>

    <button id="btnsigBiho">
        Siguiente BiHorario
    </button>

    <button id="btnLoadBiho">
        Continuar Biho
    </button>

</div>
    <!-- Tabla -->
    <div class="table-card">

        <table
            class="table table-bordered align-middle"
            id="tablaOT">

            <thead>

                <tr>
                    <th>Operacion</th>
                <!--   <th>Módulo</th>-->
                   <!--    <th>Turno</th>-->
                    <th>Nombre</th>
                    <th>Min/Día</th>
                    <th>OT</th>
                    <th>Cant. OT</th>
                    <th>Fecha</th>
                    <th>Tiempo Ciclo</th>
                    <th>Estándar</th>
                    <th>Acciones</th>
                </tr>

            </thead>

            <tbody id="cuerpoTabla">
            </tbody>

        </table>

    </div>

</div>

<div id="lista-empleados"
     class="list-group position-absolute"
     style="display:none;">
</div>



<!-- PANEL LATERAL MODERNO (OFFCANVAS) PARA DETALLES DE ASIGNACIÓN -->
<div class="offcanvas offcanvas-end w-100 w-md-50" tabindex="-1" id="panelDetalleEmpleado" aria-labelledby="panelDetalleEmpleadoLabel" style="max-width: 550px;">
  <div class="offcanvas-header bg-dark text-white">
    <h5 class="offcanvas-title" id="panelDetalleEmpleadoLabel">
      <span id="panel-icono">👤</span> Detalle de Asignación
    </h5>
    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
  </div>
  <div class="offcanvas-body bg-light">
    <!-- Encabezado del Empleado y OT dentro del panel -->
    <div class="card mb-3 shadow-sm">
      <div class="card-body">
        <h6 class="card-subtitle mb-2 text-muted" id="panel-ot-name">ORDEN DE TRABAJO</h6>
        <h5 class="card-title text-primary" id="panel-empleado-name">Nombre del Empleado</h5>
        <p class="card-text mb-1"><strong>Operación:</strong> <span id="panel-operacion-name">-</span></p>
        <p class="card-text mb-0"><strong>Estándar Asignado:</strong> <span id="panel-estandar-val">-</span></p>
      </div>
    </div>

    <!-- Contenedor dinámico donde se inyectarán los horarios y acciones -->
    <div id="panel-contenido-dinamico">
      <!-- Aquí se renderizarán las filas de tiempos de forma vertical y limpia -->
    </div>
  </div>
</div>

<div id="drawerDetalleEmpleado" class="drawer-detalle">
    <div class="drawer-header">
        <h4 id="drawerTituloEmpleado">Detalle de Operación</h4>
        <button type="button" class="btn-cerrar-drawer" id="btnCerrarDrawer">&times;</button>
    </div>
    <div class="drawer-body" id="drawerContenidoBody">
        <!-- Aquí es donde jQuery inyectará el contenido -->
    </div>
</div>



<!-- Scripts de Bootstrap requeridos para controlar el Panel Lateral -->
<!--<script src="https://jsdelivr.net"></script>-->



<input
    type="hidden"
    value="${backendUrl}"
    id="url-backend"
/>

 <div id="backfond" style="z-index: 3;display:none; position: fixed; inset: 0px; background: rgba(0, 0, 0, 0.3);"></div>
  <table  border="1" id="tabladellR" style=" z-index: 4;display:none;width: 30%;position: absolute;top: 50%;left: 20%;text-align:center;background-color: black;color: white;"></table>
 <div id="loading" style="top: 30%;left: 40%;position: absolute;display:none;z-index: 4">
     <img src="https://4664764.app.netsuite.com/core/media/media.nl?id=1989781&c=4664764&h=rnkxZLN4KuERAwdOwVui4AzbZSRjGnRZbNcfW2xPrJBeR8SL" style="width: 10em" />
 </div>
<script src="${mainJs.url}"></script>

</body>
        </html>
        `;

        return home;
    };


  const GETInformationOT=(OTArray,supervisor)=>{

  log.debug("OTArray", OTArray);
 //   const idsBuscar = [20945927, 20945928, 20945929];
    const idsString = OTArray.join(',');
    
     const sql=`SELECT 
ot.id as id_OT,
ot.tranid as name_OT,
ot.quantity as qty_OT,
ot.assemblyitem as item_OT,
ot.custbodyiqsassydescription as itemtext_ot,
ot.custbody_cantidad_original as qtyOriginal_OT,
ot.custbody_ptorigen as otPadre_OT,

item.id_compo as itemid_compo,
    item.text_compo as itemtext_compo,
    item.qty_compo as qty_compo,
    
routing.custrecord_ruta_produccion as closter,

    secu.id as id_Operacion,
    secu.custrecord_imr_descripcion_operacion_sec as Dec_Operacion,
    secu.custrecord_imr_tiempo_minutos as tiempo_Operacion,
    

 
     OPE.custrecord_modulo as modulo_ope,
      OPE.custrecord_op_tipo_operacion as tipoop_secuencia

    
FROM 
    workorder ot 
    LEFT JOIN (
        SELECT 
            woItem.workOrder,
            woItem.item as id_compo,
            BUILTIN.DF(woItem.item) as text_compo,
            woItem.quantity as qty_compo
        FROM 
            workOrderItem woItem
            INNER JOIN workorder subOT ON subOT.id = woItem.workOrder
        WHERE 
            BUILTIN.DF(woItem.item) LIKE 'C%'
            AND woItem.item <> subOT.assemblyitem 
    ) item ON item.workOrder = ot.id
       INNER JOIN ManufacturingRouting routing ON routing.id = ot.manufacturingrouting 
    INNER JOIN CUSTOMRECORD_IMR_SECUENCIA secu ON secu.custrecord_imr_rutaproduccion_secuencia = routing.custrecord_ruta_produccion 
 INNER JOIN customrecord_imr_operaciones OPE ON OPE.id = secu.custrecord_imr_operaciones_secuencia 
     
WHERE 
     ot.id IN (${idsString}) 
     `;
    
    const results = query.runSuiteQL({ query: sql }).asMappedResults();
   
   const resultado = results.reduce((acc, curr) => {
    const { id_ot, name_ot, qty_ot, item_ot,itemtext_ot, qtyoriginal_ot,otpadre_ot} = curr;

    // Si la OT aún no existe en nuestro acumulador, la creamos
    if (!acc[id_ot]) {
        acc[id_ot] = {
            id_ot: id_ot,
            name_ot: name_ot,
            qty_ot: qty_ot,
            item_OT:item_ot,
            itemtext_OT:itemtext_ot,
           qtyOriginal_OT:qtyoriginal_ot,
            otPadre_OT:otpadre_ot,
          
            componentes: [],
            Operaciones: []
        };
    }

    // Agregar componente si no existe en esta OT específica
    const existeCompo = acc[id_ot].componentes.some(c => c.itemid_compo === curr.itemid_compo);
    if (!existeCompo) {
        acc[id_ot].componentes.push({
            itemid_compo: curr.itemid_compo,
            itemtext_compo: curr.itemtext_compo,
            qty_compo: curr.qty_compo
        });
    }

    // Agregar operación si no existe en esta OT específica
    const existeOp = acc[id_ot].Operaciones.some(o => o.id_operacion === curr.id_operacion);
    if (!existeOp) {
        acc[id_ot].Operaciones.push({
            id_operacion: curr.id_operacion,
            dec_operacion: curr.dec_operacion,
            tiempo_operacion: curr.tiempo_operacion,
             tipoop_secuencia: curr.tipoop_secuencia,
             modulo_ope:curr.modulo_ope
        });
    }

    return acc;
}, {});
    
    
  
    return resultado
    
  }
   const getBihorario=(OTArray,supervisor)=>{

  log.debug("OTArray", OTArray);
      log.debug("supervisor", supervisor);
 //   const idsBuscar = [20945927, 20945928, 20945929];
    const idsString = OTArray.join(',');
      log.debug("idsString", idsString);

        
            var sql=`SELECT 
   bihoPa.id as id_bihoPa,
     bihoPa.custrecord_biho_fecha as fecha_bihoPa,
      bihoPa.custrecord_biho_empleado as empleadoid_bihopa,
          emp.entityid || ' ' || emp.firstname || ' ' || emp.lastname as empleadoText_bihoPa,
       bihoPa.custrecord_biho_ot as ot_bihoPa,
        bihoPa.custrecord_biho_operacion as operacion_bihoPa,
         bihoPa.custrecord_biho_estatus as estatus_bihoPa,
         bihoPa.custrecord_biho_estandar as estandar_bihopa,
           bihoPa.custrecord_biho_tiempo as tiempo_bihopa,
           
            bihoPa.custrecord_biho_total as total_bihopa,
             bihoPa.custrecord_pz_x_bihorario as pzxbiho_bihopa,
               bihoPa.custrecord_biho_pzot as pzot_bihopa,
                 bihoPa.custrecord_biho_supervisor as supervisor_bihopa,

         BihoDe.id as id_bihode,
          BihoDe.custrecord_biho_det_qty as qty_bihoDe,
           BihoDe.custrecord_biho_det_parent as parent_bihoDe,
           BihoDe.custrecord_biho_det_horario as horario_bihoDe,
            BihoDe.custrecord_biho_det_estatus as estatus_bihode,
             BihoDe.custrecord_biho_det_esperado as esperado_bihode,
              BihoDe.custrecord_biho_det_horario as no_bihode,
              BihoDe.custrecord_biho_motivo_tm as motibotm_bihode,
              BihoDe.custrecord_biho_duracion_tm as tottm_bihode,
              
FROM 
    customrecord_bihorario_parent bihoPa 
   LEFT JOIN customrecord_biho_det BihoDe ON BihoDe.custrecord_biho_det_parent = bihoPa.id 
   LEFT JOIN 
    employee emp ON bihoPa.custrecord_biho_empleado = emp.id
WHERE 
     bihoPa.custrecord_biho_ot IN (${idsString}) 
     AND TRUNC(bihoPa.custrecord_biho_fecha) = TRUNC(CURRENT_DATE)
     `;
       
     if(supervisor){
            var sql=`SELECT 
   bihoPa.id as id_bihoPa,
     bihoPa.custrecord_biho_fecha as fecha_bihoPa,
      bihoPa.custrecord_biho_empleado as empleadoid_bihopa,
          emp.entityid || ' ' || emp.firstname || ' ' || emp.lastname as empleadoText_bihoPa,
       bihoPa.custrecord_biho_ot as ot_bihoPa,
        bihoPa.custrecord_biho_operacion as operacion_bihoPa,
         bihoPa.custrecord_biho_estatus as estatus_bihoPa,
         bihoPa.custrecord_biho_estandar as estandar_bihopa,
           bihoPa.custrecord_biho_tiempo as tiempo_bihopa,
           
            bihoPa.custrecord_biho_total as total_bihopa,
             bihoPa.custrecord_pz_x_bihorario as pzxbiho_bihopa,
               bihoPa.custrecord_biho_pzot as pzot_bihopa,
                 bihoPa.custrecord_biho_supervisor as supervisor_bihopa,

         BihoDe.id as id_bihode,
          BihoDe.custrecord_biho_det_qty as qty_bihoDe,
           BihoDe.custrecord_biho_det_parent as parent_bihoDe,
           BihoDe.custrecord_biho_det_horario as horario_bihoDe,
            BihoDe.custrecord_biho_det_estatus as estatus_bihode,
             BihoDe.custrecord_biho_det_esperado as esperado_bihode,
              BihoDe.custrecord_biho_det_horario as no_bihode,
              BihoDe.custrecord_biho_motivo_tm as motibotm_bihode,
              BihoDe.custrecord_biho_duracion_tm as tottm_bihode,
              
FROM 
    customrecord_bihorario_parent bihoPa 
   LEFT JOIN customrecord_biho_det BihoDe ON BihoDe.custrecord_biho_det_parent = bihoPa.id 
   LEFT JOIN 
    employee emp ON bihoPa.custrecord_biho_empleado = emp.id
WHERE 
     bihoPa.custrecord_biho_ot IN (${idsString}) 
     AND TRUNC(bihoPa.custrecord_biho_fecha) = TRUNC(CURRENT_DATE)
     AND   bihoPa.custrecord_biho_supervisor=${supervisor}
     `;
       
     }

     

    
     const results = query.runSuiteQL({ query: sql }).asMappedResults();   
   const resultado = results.reduce((acc, curr) => {
    // Si la OT aún no existe en nuestro acumulador, la creamos
    if (!acc[curr.id_bihopa]) {      
        acc[curr.id_bihopa] = {
            id_bihopa: curr.id_bihopa,
            fecha_bihopa: curr.fecha_bihopa,
            empleadoid_bihopa: curr.empleadoid_bihopa,
            empleadoText_bihoPa: curr.empleadotext_bihopa,
            ot_bihopa:curr.ot_bihopa,
             operacion_bihopa:curr.operacion_bihopa,
             estatus_bihopa:curr.estatus_bihopa,
          estandar_bihopa:curr.estandar_bihopa,
           tiempo_bihopa:curr.tiempo_bihopa,
          
           total_bihopa:curr.total_bihopa,
           pzxbiho_bihopa:curr.pzxbiho_bihopa,
           pzot_bihopa:curr.pzot_bihopa,
            supervisor:curr.supervisor_bihopa,
            DetalleBiho: []
        };
    }
    // Agregar componente si no existe en esta OT específica
   // const existeDetalle = acc[curr.id_bihopa].DetalleBiho.some(c => c.parent_bihode === curr.id_bihoPa);
      const existeDetalle = acc[curr.id_bihopa].DetalleBiho.some(c => c.id_bihode === curr.id_bihode);
    if (!existeDetalle) {
        acc[curr.id_bihopa].DetalleBiho.push({
           id_bihode: curr.id_bihode,
            qty_bihode: curr.qty_bihode,
            horario_bihode: curr.horario_bihode,
           estatus_bihode:curr.estatus_bihode,
          esperado_bihode:curr.esperado_bihode,
           no_bihode:curr.no_bihode,
           motibotm:curr.motibotm_bihode,
           tottm:curr.tottm_bihode,
        });
    }


    return acc;
}, {});
  
    return resultado
    
  }
  
  const GETOtRelacionadas=(OT)=>{

    const entitySearchObj = search.create({
            type: "workorder",
            filters: [["custbody_ptorigen", "is", OT],'and',['mainline','is',true]],
            columns: ["type",'custbody_ptorigen'],
        });
    var IDs=[]
       entitySearchObj.run().each((result) => {
         IDs.push(result.id)
        //  var employeeLocationMultiple=result.getValue({name: "custentity_ubitras"})
            return true;
        });

    var response={
      OtPrincipal:OT,
      IDs:IDs
    }
    
    return response
    
  }

  

    const GetrecordType = (idrecord,fields,filtersR,campo,filtersR2,opc) => {


       log.debug("GetrecordType", idrecord+"_"+fields+"_"+filtersR+"_"+campo+"_"+filtersR2+"_"+opc);
      
      if(!filtersR){
        filtersR=["isinactive", "is", false]
      }

     //  log.debug("filtersR", filtersR);
    if(filtersR2){
      var entitySearchObj = search.create({
            type: idrecord,
            filters: [["isinactive", "is", false],'AND',filtersR,'AND',filtersR2],
            columns: fields,
        });
    
}else{
      var entitySearchObj = search.create({
            type: idrecord,
            filters: [["recordtype", "is", idrecord],'AND',filtersR],
            columns: fields,
        });
}

     //  log.debug("entitySearchObj", entitySearchObj);


        var CanaSelect="<option value='0'>Seleccionar..</option>"
      var DatosAdicionales={}
      var Abrebiation=""
        entitySearchObj.run().each((result) => {     

          var option=" "
            for (var index = 0; index < fields.length; index++) {
               var Campo=fields[index].name
              
                 if(Campo!='name'){
                    DatosAdicionales[Campo]=result.getValue({name:Campo}) 
                   option=option+Campo+"='"+result.getValue({name:Campo})+"' ";
                 }
                  if(Campo==campo){
                    Abrebiation=result.getValue({name:Campo})
                 }

              
              
            
               }
         CanaSelect=CanaSelect+"<option"+option+"value='"+result.id+"'>"+result.getValue({name:campo})+"</option>";

            return true;
        });
      

      if(opc==2){
         return Abrebiation;
      }
        return CanaSelect;
    }; 

    const buscarEmpleado = (criterio) => {

   //    log.debug("criterio", criterio);
  let criterioLimpio = criterio.replace(/'/g, "''");

    let employeeSearch = search.create({
        type: search.Type.EMPLOYEE,
        filters: [
            // Filtro 1: La fórmula (Objeto)
            search.createFilter({
                name: 'formulanumeric',
                operator: search.Operator.EQUALTO,
                formula: `CASE WHEN {entityid} = '${criterioLimpio}' OR UPPER({firstname} || ' ' || {lastname}) LIKE UPPER('%${criterioLimpio}%') THEN 1 ELSE 0 END`,
                values: [1] // Importante: values siempre debe ser un array
            }),
            // Filtro 2: Inactivos (Objeto para mantener consistencia)
            search.createFilter({
                name: 'isinactive',
                operator: search.Operator.IS,
                values: ['F']
            })
        ],
        columns: [
            search.createColumn({ name: 'entityid' }),
            search.createColumn({ name: 'firstname' }),
            search.createColumn({ name: 'lastname' }),
           search.createColumn({ name: 'subsidiary' }),
           search.createColumn({ name: 'custrecord_imr_minutos_jornada',join:'custentity_imr_jornada' }),
          search.createColumn({ name: 'name',join:'custentity_imr_jornada' })
        ]
    });
       // log.debug("employeeSearch", employeeSearch);
        let resultados = [];
        employeeSearch.run().each(result => {
            resultados.push({
                id: result.id,
                entityId: result.getValue('entityid'),
                fullName: result.getValue('firstname') + ' ' + result.getValue('lastname'),
                subsidiary: result.getText('subsidiary'),
               tiempoJornada: result.getValue({name:'custrecord_imr_minutos_jornada',join:'custentity_imr_jornada'}),
              turno: result.getValue({name:'name',join:'custentity_imr_jornada'})
            });
            return true; // Continuar recorriendo
        });

        return resultados;
    };
    const createRecord=(registro,campos,valores,idUpdate)=>{
    if(idUpdate){
       var registroObj = record.load({type: registro, id:idUpdate,isDynamic: true});      
    }else{
       var registroObj = record.create({type: registro,isDynamic: true});
    }
   
    for (var index = 0; index < campos.length; index++) {
       registroObj.setValue({
                fieldId: campos[index],
                value: valores[index] 
            });      
    }
    var registroID = registroObj.save();
            log.debug('registroID',  registroID);
   return registroID  
  }

    const setParentInformation = (information) => {

      var ObjSaved=[]
      information.forEach(filaData => {
         var fecha=filaData.fecha
         var partes = fecha.split('/');
    var dateObj = new Date(partes[2], partes[1] - 1, partes[0]);
         var fecha = format.parse({
        value: dateObj,
        type: format.Type.DATE
    });
        
        
          var idEmpleado=filaData.idEmpleado
          var idOT=filaData.idOT
          var idOperacion=filaData.idOperacion
          var idseguimiento=filaData.seguimiento
          var estatus=filaData.estatus
          var estandar=filaData.qtyEstandar
           var tiempo=filaData.tiempo
        var TotalBihorarios=filaData.TotalBihorarios
           var pzOT=filaData.pzOT
           var tiempoRequerido=filaData.tiempoRequerido
           var PZXbiohorario=filaData.PZXbiohorario

         var idSupervisor=filaData.idSupervisor
        var IdUnico=filaData.idUnico1

        
        if(idseguimiento){
          var campos=['custrecord_biho_estatus']
           var valores=[estatus]         
          var idBihorarioPa=createRecord('customrecord_bihorario_parent',campos,valores,idseguimiento)
       //   ObjSaved.push(idBihorarioPa+"_"+idEmpleado+"_"+idOT+"_"+idOperacion)          
        }else{
          var campos=['custrecord_biho_idunico','custrecord_biho_supervisor','custrecord_pz_x_bihorario','custrecord_biho_tiempor','custrecord_biho_pzot','custrecord_biho_total','custrecord_biho_tiempo','custrecord_biho_estandar','custrecord_biho_fecha','custrecord_biho_empleado','custrecord_biho_ot','custrecord_biho_operacion']
           var valores=[IdUnico,idSupervisor,PZXbiohorario,tiempoRequerido,pzOT,TotalBihorarios,tiempo,estandar,fecha,idEmpleado,idOT,idOperacion]         
          var idBihorarioPa=createRecord('customrecord_bihorario_parent',campos,valores)
         // ObjSaved.push(idBihorarioPa+"_"+idEmpleado+"_"+idOT+"_"+idOperacion)
        }
          ObjSaved.push(idBihorarioPa+"_"+idEmpleado+"_"+idOT+"_"+idOperacion)
      });
      return ObjSaved
   
  };
  function GetOtIniciadas(supervisor) {
              const sql=`SELECT 
        custrecord_biho_ot as OT
           FROM 
         customrecord_bihorario_parent biho
           WHERE 
        biho.custrecord_biho_supervisor = ${supervisor}
         AND TRUNC(biho.custrecord_biho_fecha) = TRUNC(CURRENT_DATE)`;
    
    const results = query.runSuiteQL({ query: sql }).asMappedResults();
          var IdOtArray=[]
          for (var index = 0; index < results.length; index++) {
            var OT=results[index].ot
            IdOtArray.push(OT)
          }
    return IdOtArray
    
  }
  
    const procesarSolicitud=(opcion,obj)=>{
      obj=JSON.parse(obj)
         log.debug("obj", obj);
       var respuesta={}
      if(opcion=='getOtInformation'){
        if(obj.otBuscada && obj.supervisor){
          var OtId=GetrecordType('workorder',['name','internalid'],["tranid", "is", obj.otBuscada],'internalid',null,2)
         var OTRelacionadas=GETOtRelacionadas(OtId)
          if(OTRelacionadas.length>0){            
          }else{
            OTRelacionadas.IDs.push(OtId)
          }

       
           var response=GETInformationOT(OTRelacionadas.IDs)
          var Bihorario=getBihorario(OTRelacionadas.IDs,obj.supervisor)
          
            var next= SetSiguiente(Bihorario,OTRelacionadas.IDs,false)
           log.debug("Bihorario", Bihorario);
          var respuesta={
            OtPrincipal:OtId,
            response:response,
            Bihorario:Bihorario,
            next:next
          }
        }
         if(obj.idOT){
           if(obj.Todo){
                var OTRelacionadas=GETOtRelacionadas(obj.idOT)
               if(OTRelacionadas.length>0){}
               else{OTRelacionadas.IDs.push(obj.idOT)}             
           }else{
               var OTRelacionadas={"IDs":[obj.idOT]}
           }
            var response=GETInformationOT(OTRelacionadas.IDs)
              log.debug("Bihorario", Bihorario);
          var respuesta={response:response}
           
         }
      }
      if(opcion=='getEmpleado'){
        var respuesta=buscarEmpleado(obj.empleado)
      }
     if(opcion=='setParentInformation'){
       var informacion=obj.datosParaGuardar
         var bihorarioAct=obj.bihorarioAct
        var resultado=setParentInformation(obj.datosParaGuardar)
         log.debug("resultado1", resultado);
  
       
       var datoresultado=resultado[0].split("_")
       var IDParent=datoresultado[0]
            log.debug("resultado2", datoresultado);
       var ArrayOt=[informacion[0].idOT]
          log.debug("resultado3", ArrayOt);
       
       //guardamos los detalles

        var bihorario=getBihorario(ArrayOt,obj.supervisor)
       
       if(bihorarioAct>0){
          var next= SetSiguiente(bihorario,ArrayOt,true,bihorarioAct,IDParent)
         
       }
 
         
       ////////////////
       var bihorario=getBihorario(ArrayOt,obj.supervisor)
      
       var respuesta={
         'resultado':resultado,
         'bihorario':bihorario
       }
       
      }

      if(opcion=='setbihorarioDetalle'){  
        var supervisor=obj.supervisor

       
        
        
        if(obj.opcion=='sumar'){
           var campos=['custrecord_biho_det_qty']
           var valores=[obj.qty]  
           var respuesta=createRecord('customrecord_biho_det',campos,valores,obj.idDetalle)
        }
        else if(obj.opcion=='addTiempoM'){
          var campos=['custrecord_biho_motivo_tm','custrecord_biho_duracion_tm']
           var valores=[obj.motivo,obj.duracion]  
           var respuesta=createRecord('customrecord_biho_det',campos,valores,obj.idDetalle)
          
        }
          else if(obj.opcion=='ForzarNext'){
             var Datos=obj.Detalle
             var valorActual=obj.bihoAct
             var NewBiho=parseInt(valorActual)+1
            
             var Bihorarios=getBihorario(Datos,supervisor)
            if(Bihorarios){
              Object.values(Bihorarios).forEach(function(bihorario){
                        bihorario.DetalleBiho.forEach(function(detalle){
                          var iddetalle=detalle.id_bihode
                          
                    
                           var campos=['custrecord_biho_bihoformazo']
                           var valores=[NewBiho]                
                 var idF=createRecord('customrecord_biho_det',campos,valores,iddetalle)                        

                             return 1
                        });

                    });
              
              
            }
             log.debug("fin respuesta -0", respuesta) 
          //   log.debug("ForzarNext Bihorarios", Bihorarios)
            
          }
        else{
          var Datos=obj.Detalle
      //    Datos=JSON.parse(Datos)
           var terminar=obj.terminar
           
             var opcion=obj.opcion

            log.debug("Datos", Datos);
            if(terminar){
            for (var index = 0; index < Datos.length; index++) {
            var valores=Datos[index]
            valores=valores.split("_")
           var iddetalle=valores[0]
           var cantidadCompleta=valores[1]
            
      
           var campos=['custrecord_biho_det_estatus','custrecord_biho_det_esperado']
           var valores=[true,cantidadCompleta]  
              
           var respuesta=createRecord('customrecord_biho_det',campos,valores,iddetalle)
          
            
          }
              
            }
            else{
            // log.debug("Datos11", Datos);
              var DatosSiguiente=CerrarAnteriores(Datos,supervisor)
              log.debug("DatosSiguiente", DatosSiguiente);
              
                var Bihorarios=getBihorario(Datos,supervisor)
             var next= SetSiguiente(Bihorarios,Datos,true)
               var Bihorarios=getBihorario(Datos,supervisor)
             
              var respuesta={
                next:next,
                respuesta:Bihorarios
              }
              
             // return
            }
              
          
           

        }


          
  
        }
        log.debug("fin respuesta 0", respuesta) 

        if(opcion=='getbihorarios'){  
          var Supervisor=obj.idSupervisor
 log.debug("Supervisor 1",Supervisor);
          var IdOtArray=GetOtIniciadas(Supervisor)
            log.debug("IdOtArray",IdOtArray);
          
/*
          const sql=`SELECT 
        custrecord_biho_ot as OT
           FROM 
         customrecord_bihorario_parent biho
           WHERE 
        biho.custrecord_biho_supervisor = ${Supervisor}
         AND TRUNC(biho.custrecord_biho_fecha) = TRUNC(CURRENT_DATE)`;
    
    const results = query.runSuiteQL({ query: sql }).asMappedResults();
          var IdOtArray=[]
          for (var index = 0; index < results.length; index++) {
            var OT=results[index].ot
            IdOtArray.push(OT)
          }  
          */
          if(IdOtArray.length>0){
             var response=GETInformationOT(IdOtArray)
             log.debug("1", 2);
          var Bihorario=getBihorario(IdOtArray,Supervisor)
             log.debug("2", 3);
            var next= SetSiguiente(Bihorario,IdOtArray,false)
           log.debug("Bihorario", Bihorario);
          var respuesta={
           // OtPrincipal:OtId,
            response:response,
            Bihorario:Bihorario,
            next:next
          }
            
          }else{
            var respuesta={
           // OtPrincipal:OtId,
            response:0,
          }
          }
        
      
        }

        if(opcion=='getbitacorasProduccion'){  
          log.debug("getbitacorasProduccion", obj);
          var OT=obj.idOT
         

          const sql=`SELECT 
     WO.id as IdWo,
     WO.custbody_ptorigen as PtOrigen,
     --   bita.custrecord_bit_ot_pt as OT,
       bita.id as Id_bitacora,
        bita.custrecord_bit_completo as completo,
         bita.custrecord_bit_woc as id_woc,
       WOC.createdfrom as CreadoDesde,
           FROM 
           workorder WO         
          left JOIN   customrecord_bit_detalle bita on bita.custrecord_bit_ot_pt= wo.id
          left JOIN workordercompletion WOC on WOC.id= bita.custrecord_bit_woc
       
           WHERE 
          wo.id  = ${OT}
           OR WOC.custbody_ptorigen = ${OT}
       `;
    var Agreupador=[]
    const results = query.runSuiteQL({ query: sql }).asMappedResults();
          var IdOtArray=[]
          for (var index = 0; index < results.length; index++) {
              log.debug("objResponse", results[index]);
            var IdWo=results[index].idwo
            var completo=results[index].completo||false
             var  ptorigen=results[index].ptorigen
             var  creadodesde=results[index].creadodesde
             var  id_woc=results[index].id_woc
            var isPt=false
            
            if(parseInt(IdWo)==parseInt(ptorigen))
            {
              isPt=true
            }
             results[index].isPt=isPt
            /*
            var objResponse={
              "Ot":IdWo,
              "completo":completo,
              "ptorigen":ptorigen,
              "creadodesde":creadodesde,
                "id_woc":id_woc,
              "isPt":isPt
            }
            // log.debug("objResponse1", objResponse);
                */
            Agreupador.push(results[index])
              
              log.debug("Agreupador", Agreupador);

            
           
            IdOtArray.push(OT)
          }  
          
        
          var respuesta=Agreupador
      
        }


      if(opcion=='GetRalacionadas'){
         //  obj=JSON.parse(obj)
              if(obj.OTValidar){
                log.debug("obj.OTValidar", obj.OTValidar);
          var OtId=GetrecordType('workorder',['name','internalid'],["tranid", "is", obj.OTValidar],'internalid',null,2)
        log.debug("obj.OtId",OtId);
                var OTRelacionadas=GETOtRelacionadas(OtId)
                        log.debug("obj.OTRelacionadas",OTRelacionadas);
          if(OTRelacionadas.IDs.length>0){
              var respuesta={
                OTRelacionadas: OTRelacionadas.IDs
             }
          }else{
             var respuesta={
                OTRelacionadas: []
             }
          }
        
      }
      }

       log.debug("fin respuesta", respuesta) 

      return respuesta
      
    
    };

    const CerrarAnteriores = (IdsArray,supervisor) => {

              var Bihorario=getBihorario(IdsArray,supervisor)

       

      var ResponseNext=[]
       Object.keys(Bihorario).forEach(key => {
    const padre = Bihorario[key];
    const idPadre = padre.id_bihopa;
    const tiempo = padre.tiempo_bihopa;
         
   
         const detalles = padre.DetalleBiho || [];
 
   
     
     
     
         
         
     //     log.debug("closeBIHO detalles", detalles);
         for (let index = 0; index < detalles.length; index++) {
        
           var idDetalle=detalles[index].id_bihode
          var campos=['custrecord_biho_det_parent','custrecord_biho_det_horario','custrecord_biho_det_esperado']
             var campos=['custrecord_biho_det_estatus']
           var valores=[true]                
           var respuesta=createRecord('customrecord_biho_det',campos,valores,idDetalle)
  
         }
         

       
         

         
});
       

        return true;
    };
  
  

     const SetSiguiente = (Bihorario,IdsArray,isSiguiente,bihoAct,idDirecto) => {

            //  var Bihorario=getBihorario(IdsArray)

        log.debug("Bihorario SetSiguiente:",Bihorario);

       // log.debug("Bihorario 0", Bihorario);


       var Next={}
       Object.keys(Bihorario).forEach(key => {
    const padre = Bihorario[key];
    const idPadre = padre.id_bihopa;
    const tiempo = padre.tiempo_bihopa;
    const estandar = padre.estandar_bihopa;
         if(idDirecto && idDirecto!=idPadre){
           return           
         }

          const total_bihopa = padre.total_bihopa;
           var pzxbiho_bihopa = padre.pzxbiho_bihopa;
           const pzot_bihopa = padre.pzot_bihopa;

           const detalles = padre.DetalleBiho || [];
           var CantidadActual=0

         var CantidadActual = detalles.reduce((max, actual) => {
              return Number(actual.horario_bihode) > Number(max.horario_bihode)? actual: max;
         });
         if(CantidadActual){
           CantidadActual=parseInt(CantidadActual.horario_bihode)
         }
         
         /*
             if(detalles[0].id_bihode){
             var CantidadActual=detalles.length
            }else{
              var CantidadActual=0
            }
            */
          if(detalles[0].id_bihode){
             var totalDetalleRegistrado=detalles.length
            }else{
              var totalDetalleRegistrado=0
            }
            
          var PZActuales=totalDetalleRegistrado*pzxbiho_bihopa
         var Faltante=pzot_bihopa-PZActuales
         if(Faltante<pzxbiho_bihopa){
           pzxbiho_bihopa=Faltante
         }
         var CrearNext=true
         if(CantidadActual>=total_bihopa ){
         //   log.debug("CrearNext:"+key,'entro');
           CrearNext=false;
         }
         
         
         if(CrearNext && isSiguiente){
             log.debug("detalles", detalles);
        if(detalles[0].id_bihode){
             var totalDetalles=CantidadActual
            }else{
              var totalDetalles=0
            }
             totalDetalles=totalDetalles+1
           if(bihoAct){
             totalDetalles=bihoAct
           }

          var campos=['custrecord_biho_det_parent','custrecord_biho_det_horario','custrecord_biho_det_esperado']
           var valores=[idPadre,totalDetalles,pzxbiho_bihopa]  
              
          
                   var respuesta=createRecord('customrecord_biho_det',campos,valores)
           
         }
         Next[key]=CrearNext

         

         
});
       

        return Next;
    };
  

    const getMainForm = (parameters) => {

       var opc=parameters.opc
        log.debug("parameters", parameters);
    //    const mainCss = file.load({id: "./home/home.css",});
        const mainJs = file.load({id: "./home/home.js",});
        const intimaLogo = file.load({id: "./home/logo-min.svg",});
        const globalCss = file.load({id: "./home/global.css",});

  
        const currentUserObj = runtime.getCurrentUser();
      log.debug("currentUserObj", currentUserObj);

      //  const currentEmployee = handleEmployeeType(currentUserObj.id); 

   //  const TipoProducto=GetrecordType('customrecordimr_tipo_producto_blpt_clave',['name','custrecord_imr_clave_intima_pt'],"",'name')



       const backendUrl = url.resolveScript({
            scriptId: "customscript_bihorario",
            deploymentId: "customdeploy_bihorario",
        });
      

          return homePageHtml(
            globalCss,
        //    mainCss,
            mainJs,
            intimaLogo,
            backendUrl,
            currentUserObj,
            
        );
        
    };



    const onRequestGet = (context) => {
           
        var opcion=context.request.headers.opcion;      
       log.debug("GET parameters opcion", opcion);
      if(opcion){
          log.debug("headers", context.request.headers);
        var obj=context.request.headers.data;
        log.debug("GET parameters obj", obj);
        var Response=procesarSolicitud(opcion,obj)

        context.response.write({
          output: JSON.stringify({
            Response,
          }),
        });
      }else{
         const htmlLoginForm = getMainForm(context.request.parameters);
         var form = serverWidget.createForm({ title: 'Formularios' });
         var f_init = form.addField({
                id : 'filterinit',
                label : 'Inicio',
                type : serverWidget.FieldType.INLINEHTML
            });
       f_init.defaultValue=htmlLoginForm;
        context.response.write({
            output: htmlLoginForm,
        });        
      }
  
      
    };

    const onRequestPost = (context) => {};

    const onRequest = (context) => {
        if (context.request.method === "GET") {
            try {
                onRequestGet(context);
            } catch (error) {
                log.debug("GET ERROR", error);
            }
        } else {
            try {
                log.debug("POST entro",1);
                onRequestPost(context);
            } catch (error) {
                log.debug("POST ERROR", error);
            }
        }
    };

    return {
        onRequest,
    };
});
