/**
 * MTA MARKET - SYSTEM SCRIPT (VERSIÓN ELITE)
 * Corrección de visualización, centrado y funciones de admin
 */

// --- 1. GESTIÓN DE BASE DE DATOS LOCAL ---
function obtenerDB() {
    return JSON.parse(localStorage.getItem('mapeos_db')) || [];
}

function guardarDB(data) {
    localStorage.setItem('mapeos_db', JSON.stringify(data));
}

// --- 1.5. SISTEMA DE LOGS ---
function registrarLog(accion, usuario, detalles) {
    let logs = JSON.parse(localStorage.getItem('logs_db')) || [];
    logs.push({
        id: Date.now(),
        usuario: usuario,
        accion: accion,
        detalles: detalles,
        fecha: new Date().toISOString()
    });
    localStorage.setItem('logs_db', JSON.stringify(logs));
}

function obtenerLogs() {
    return JSON.parse(localStorage.getItem('logs_db')) || [];
}

// --- 1.6. SISTEMA DE AUDITORÍA ---
function obtenerAuditoria() {
    return JSON.parse(localStorage.getItem('auditoria_db')) || [];
}

function guardarAuditoria(data) {
    localStorage.setItem('auditoria_db', JSON.stringify(data));
}

// --- 2. LÓGICA DE LA TIENDA (HOME) ---
function actualizarTienda(busqueda = '') {
    const grid = document.getElementById('tienda-grid');
    if (!grid) return;
    grid.innerHTML = "";
    
    let productos = obtenerDB();

    // Filtro de búsqueda elegante
    if (busqueda !== '') {
        productos = productos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()));
    }

    if (productos.length === 0) {
        grid.innerHTML = "<p style='grid-column: 1/-1; text-align:center; color:#555; padding:50px; font-size:1.2rem;'>No se encontraron mapeos disponibles.</p>";
        return;
    }

    productos.forEach(p => {
        const isSold = p.comprado;
        const isPending = p.enProceso && !p.comprado;

        // Renderizado simétrico y elegante
        grid.innerHTML += `
            <div class="card" style="position: relative;">
                <div style="position: absolute; top: 10px; left: 10px; z-index: 10; display: flex; gap: 5px;">
                    ${isSold ? '<span style="background:rgba(255,0,0,0.85); color:white; padding:4px 10px; border-radius:4px; font-size:11px; font-weight:bold; letter-spacing:1px;">VENDIDO</span>' : ''}
                    ${isPending ? '<span style="background:rgba(255,165,0,0.85); color:white; padding:4px 10px; border-radius:4px; font-size:11px; font-weight:bold; letter-spacing:1px;">PENDIENTE</span>' : ''}
                </div>
                
                <img src="${p.img}" alt="${p.nombre}" style="width:100%; height:200px; object-fit:cover;">
                
                <div class="card-content">
                    <h3 style="margin:0; font-size:1.3rem; color: #fff;">${p.nombre}</h3>
                    <p class="price" style="color: #ff0000; font-size: 1.5rem; margin: 15px 0; font-weight: bold;">$${p.precio} USD</p>
                    
                    <button class="btn-buy" 
                        ${isSold || isPending ? 'disabled' : `onclick="verProducto(${p.id})"`} 
                        style="width: 100%; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.3s;">
                        ${isSold ? 'VENDIDO' : (isPending ? 'EN ESPERA' : 'VER DETALLES')}
                    </button>
                </div>
            </div>`;
    });
}

// --- 3. MODAL Y DETALLES DE PRODUCTO ---
function verProducto(id) {
    const db = obtenerDB();
    const p = db.find(x => x.id === id);
    if (!p) return;

    const modal = document.getElementById('miModal');
    const body = document.getElementById('modal-body');
    
    if (modal && body) {
        body.innerHTML = `
            <div style="text-align:center;">
                <img src="${p.img}" style="width:100%; max-height:250px; object-fit:cover; border-radius:10px; margin-bottom:20px; border: 1px solid #333;">
                <h2 style="color: #ff0000; margin-bottom: 10px; text-transform: uppercase;">${p.nombre}</h2>
                <p style="color:#bbb; font-size: 0.9rem; margin-bottom: 20px;">
                    Adquiere este mapeo exclusivo con licencia única vinculada a tu IP. 
                    Incluye archivo de protección .LUA.
                </p>
                <div style="font-size: 2rem; color: #fff; margin-bottom: 25px; font-weight: bold;">$${p.precio} USD</div>
                <button class="btn-buy" style="width:100%; padding: 15px;" onclick="solicitarCompra(${p.id})">SOLICITAR COMPRA</button>
            </div>
        `;
        modal.style.display = "block";
    }
}

function irAlCheckout(id) {
    const p = obtenerDB().find(x => x.id === id);
    localStorage.setItem('temp_compra', JSON.stringify(p));
    window.location.href = 'checkout.html';
}

// --- 4. ADMINISTRACIÓN (ADMIN.HTML) ---
function actualizarAdmin() {
    const db = obtenerDB();
    const filtro = document.getElementById('busqueda-inv')?.value.toLowerCase() || "";
    const listaAdmin = document.getElementById('lista-admin');
    const listaSol = document.getElementById('lista-solicitudes');

    if (listaAdmin) {
        const filtrados = db.filter(m => m.nombre.toLowerCase().includes(filtro));
        listaAdmin.innerHTML = filtrados.map(m => `
            <div class="item-stock" style="display:flex; justify-content:space-between; align-items:center; background:#111; padding:15px; border-radius:8px; margin-bottom:10px; border-left:4px solid #ff0000;">
                <div style="display:flex; align-items:center; gap:15px;">
                    <img src="${m.img}" style="width:50px; height:40px; border-radius:4px; object-fit:cover;">
                    <div>
                        <b style="display:block; font-size:14px;">${m.nombre}</b>
                        <span style="color:${m.comprado ? 'red' : '#00ff00'}; font-size:12px;">$${m.precio} USD</span>
                    </div>
                </div>
                <div style="display:flex; gap:10px;">
                    <button onclick="editarMapeo(${m.id})" style="background:none; border:none; color:orange; cursor:pointer; font-size:16px;">✎</button>
                    <button onclick="borrarMapeo(${m.id})" style="background:none; border:none; color:red; cursor:pointer; font-size:18px;">×</button>
                </div>
            </div>
        `).join('') || "<p style='color:#444; text-align:center;'>Inventario vacío.</p>";
    }

    if (listaSol) {
        const pendientes = db.filter(m => m.enProceso && !m.comprado);
        listaSol.innerHTML = pendientes.map(m => `
            <div style="background:#1a1a1a; padding:15px; border-radius:8px; margin-bottom:10px; border:1px solid orange; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <b style="color:white; display:block;">${m.nombre}</b>
                    <small style="color:orange;">Pedido por: ${m.comprador}</small>
                </div>
                <button onclick="aprobarSolicitud(${m.id})" style="background:green; color:white; border:none; padding:8px 15px; border-radius:4px; cursor:pointer; font-weight:bold;">APROBAR</button>
            </div>
        `).join('') || "<p style='color:#444; text-align:center;'>No hay solicitudes pendientes.</p>";
    }
}

// --- 5.5. ESTADÍSTICAS PARA ADMINS ---
function cargarEstadisticas() {
    const db = obtenerDB();
    const usuarios = JSON.parse(localStorage.getItem('usuarios_db')) || [];
    const totalMapeos = db.length;
    const mapeosVendidos = db.filter(m => m.comprado).length;
    const mapeosPendientes = db.filter(m => m.enProceso && !m.comprado).length;
    const totalUsuarios = usuarios.length;
    const ingresos = db.filter(m => m.comprado).reduce((sum, m) => sum + parseFloat(m.precio), 0);
    const estadisticasDiv = document.getElementById('estadisticas');
    if(estadisticasDiv) {
        estadisticasDiv.innerHTML = `
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px;">
                <div style="background:#1a1a1a; padding:15px; border-radius:8px; text-align:center;">
                    <h4 style="color:#ff0000; margin:0;">Total Mapeos</h4>
                    <p style="font-size:2rem; margin:10px 0;">${totalMapeos}</p>
                </div>
                <div style="background:#1a1a1a; padding:15px; border-radius:8px; text-align:center;">
                    <h4 style="color:#ff0000; margin:0;">Vendidos</h4>
                    <p style="font-size:2rem; margin:10px 0;">${mapeosVendidos}</p>
                </div>
                <div style="background:#1a1a1a; padding:15px; border-radius:8px; text-align:center;">
                    <h4 style="color:#ff0000; margin:0;">Pendientes</h4>
                    <p style="font-size:2rem; margin:10px 0;">${mapeosPendientes}</p>
                </div>
                <div style="background:#1a1a1a; padding:15px; border-radius:8px; text-align:center;">
                    <h4 style="color:#ff0000; margin:0;">Usuarios</h4>
                    <p style="font-size:2rem; margin:10px 0;">${totalUsuarios}</p>
                </div>
                <div style="background:#1a1a1a; padding:15px; border-radius:8px; text-align:center; grid-column: span 2;">
                    <h4 style="color:#ff0000; margin:0;">Ingresos Totales</h4>
                    <p style="font-size:2rem; margin:10px 0;">$${ingresos.toFixed(2)} USD</p>
                </div>
            </div>
        `;
    }
}

// --- 5.6. AUDITORÍA PARA ADMINS ---
function cargarAuditoria() {
    const auditoria = obtenerAuditoria();
    const auditoriaDiv = document.getElementById('auditoria');
    if(auditoriaDiv) {
        if(auditoria.length === 0) {
            auditoriaDiv.innerHTML = "<p style='color:#444; text-align:center;'>No hay solicitudes registradas.</p>";
        } else {
            auditoriaDiv.innerHTML = `
                <table style="width:100%; border-collapse:collapse; color:white;">
                    <thead>
                        <tr style="border-bottom:2px solid #ff0000;">
                            <th style="padding:10px; text-align:left;">Usuario</th>
                            <th style="padding:10px; text-align:left;">Producto</th>
                            <th style="padding:10px; text-align:left;">Precio</th>
                            <th style="padding:10px; text-align:left;">Fecha</th>
                            <th style="padding:10px; text-align:left;">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${auditoria.reverse().map(a => `
                            <tr style="border-bottom:1px solid #333;">
                                <td style="padding:10px;">${a.usuario}</td>
                                <td style="padding:10px;">${a.producto}</td>
                                <td style="padding:10px;">$${a.precio} USD</td>
                                <td style="padding:10px;">${new Date(a.fecha).toLocaleString()}</td>
                                <td style="padding:10px;">${a.estado}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    }
}

// --- 5. FUNCIONES DE EDICIÓN Y SEGURIDAD ---
function aprobarSolicitud(id) {
    let db = obtenerDB();
    const i = db.findIndex(x => x.id === id);
    if (i !== -1) {
        db[i].comprado = true;
        db[i].enProceso = false;
        guardarDB(db);

        // Actualizar auditoría
        let auditoria = obtenerAuditoria();
        const aud = auditoria.find(a => a.usuario === db[i].comprador && a.producto === db[i].nombre);
        if (aud) aud.estado = 'Aprobado';
        guardarAuditoria(auditoria);

        registrarLog('Compra aprobada', db[i].comprador, `Mapeo: ${db[i].nombre}`);
        alert("¡Compra aprobada exitosamente!");
        actualizarAdmin();
    }
}

function editarMapeo(id) {
    let db = obtenerDB();
    const i = db.findIndex(x => x.id === id);
    if (i === -1) return;

    const n = prompt("Nuevo nombre:", db[i].nombre);
    const p = prompt("Nuevo precio USD:", db[i].precio);
    if (n && p) {
        db[i].nombre = n;
        db[i].precio = p;
        guardarDB(db);
        registrarLog('Editar mapeo', 'admin', `Mapeo: ${n}`);
        actualizarAdmin();
    }
}

function borrarMapeo(id) {
    if (confirm("¿Estás seguro de eliminar este mapeo?")) {
        let db = obtenerDB();
        const m = db.find(x => x.id === id);
        db = db.filter(x => x.id !== id);
        guardarDB(db);
        registrarLog('Borrar mapeo', 'admin', `Mapeo: ${m.nombre}`);
        actualizarAdmin();
    }
}

// --- 6. SISTEMA DE PROTECCIÓN LUA ---
function descargarLUA(id, nombreMapeo, ip) {
    if (!ip || ip === "Sin IP" || ip === "") {
        return alert("Error: El cliente no ha vinculado una IP.");
    }

    const db = obtenerDB();
    const m = db.find(x => x.id === id);
    registrarLog('Descargar LUA', 'admin', `Mapeo: ${nombreMapeo}, Cliente: ${m.comprador}`);

    const codigoLUA = `
--[[ 
    SISTEMA DE PROTECCIÓN MTA-MARKET 
    PRODUCTO: ${nombreMapeo}
    ESTADO: LICENCIA ACTIVADA
]]

local ipAutorizada = "${ip}"

addEventHandler("onResourceStart", resourceRoot, function()
    -- En un servidor real, aquí obtendrías la IP real del servidor
    local ipActual = "127.0.0.1" 
    
    if ipActual == ipAutorizada or ipAutorizada == "127.0.0.1" then
        outputChatBox("[MTA-MARKET] Mapeo '${nombreMapeo}' cargado correctamente.", 0, 255, 0)
    else
        outputChatBox("[MTA-MARKET] ERROR: Licencia no válida para esta IP.", 255, 0, 0)
        cancelEvent()
    end
end)`;

    const blob = new Blob([codigoLUA], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proteccion_${nombreMapeo.replace(/\s+/g, '_')}.lua`;
    a.click();
}

// --- 7. UTILIDADES ---
const DISCORD_INVITE = 'https://discord.gg/6zubJcjnM6'; // Enlace de invitación a Discord
const SERVER_URL = 'https://tu-app.railway.app'; // Reemplaza con la URL de tu servidor desplegado

function solicitarCompra(id) {
    const db = obtenerDB();
    const p = db.find(x => x.id === id);
    if (!p) return;

    const user = localStorage.getItem('usuario_logeado');

    // Registrar en auditoría
    let auditoria = obtenerAuditoria();
    auditoria.push({
        id: Date.now(),
        usuario: user,
        producto: p.nombre,
        precio: p.precio,
        fecha: new Date().toISOString(),
        estado: 'Solicitado'
    });
    guardarAuditoria(auditoria);

    // Registrar log
    registrarLog('Solicitar compra', user, `Producto: ${p.nombre}`);

    // Enviar al servidor para crear canal en Discord
    fetch(`${SERVER_URL}/crear-canal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: user, producto: p.nombre })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Solicitud registrada. Canal creado en Discord. Te redirigimos.");
            window.open(DISCORD_INVITE, '_blank');
        } else {
            alert("Error al crear canal: " + data.error);
        }
    })
    .catch(error => {
        alert("Error de conexión con el servidor. Solicitud registrada localmente.");
        console.error(error);
        // Aún redirigir si falla
        window.open(DISCORD_INVITE, '_blank');
    });

    // Cerrar modal
    document.getElementById('miModal').style.display = 'none';
}

function cerrarSesion() {
    localStorage.removeItem('usuario_logeado');
    localStorage.removeItem('tiempo_sesion');
    window.location.href = 'index.html';
}