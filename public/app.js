const token = localStorage.getItem("token");
const userName = localStorage.getItem("user") || "admin";

document.getElementById("usuario").innerText = userName;

let editandoId = null;

// ================= AGREGAR / EDITAR =================
async function agregar() {

    const data = {
        nombre: nombre.value,
        telefono: telefono.value,
        edad: edad.value,
        rol: rol.value,
        banco: banco.value,
        pago: parseFloat(pago.value) || 0
    };

    if (!data.nombre) return alert("Ingrese nombre");

    if (editandoId) {
        // EDITAR
        await fetch('/participantes/' + editandoId, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(data)
        });

        editandoId = null;

    } else {
        // CREAR
        await fetch('/participantes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(data)
        });
    }

    limpiar();
    cargar();
}

// ================= EDITAR =================
function editar(p) {

    nombre.value = p.nombre;
    telefono.value = p.telefono;
    edad.value = p.edad;
    rol.value = p.rol;
    banco.value = p.banco;
    pago.value = p.pago;

    editandoId = p.id;
}

// ================= CARGAR =================
async function cargar() {

    const res = await fetch('/participantes', {
        headers: { 'Authorization': token }
    });

    const data = await res.json();

    lista.innerHTML = "";

    data.forEach(p => {

        lista.innerHTML += `
        <tr>
            <td>${p.nombre}</td>
            <td>${p.telefono}</td>
            <td>$${p.pago}</td>
            <td style="color:#d4af37;">${p.usuario}</td>
            <td>
                <button onclick='editar(${JSON.stringify(p)})' style="background:#3b82f6;color:white;border:none;padding:6px 10px;margin-right:5px;">
                    Editar
                </button>
                <button onclick="eliminar(${p.id})" class="btn-delete">
                    Eliminar
                </button>
            </td>
        </tr>
        `;
    });

    dashboard();
}

// ================= DASHBOARD =================
async function dashboard() {

    const res = await fetch('/dashboard', {
        headers: { 'Authorization': token }
    });

    const d = await res.json();

    total.innerText = "Total: " + d.total;
    ingresos.innerText = "Ingresos: $" + d.ingresos;
    comisiones.innerText = "Ganancia: $" + d.comisiones;
}

// ================= ELIMINAR =================
async function eliminar(id) {
    await fetch('/participantes/' + id, {
        method: 'DELETE',
        headers: { 'Authorization': token }
    });

    cargar();
}

// ================= LIMPIAR =================
function limpiar() {
    nombre.value = "";
    telefono.value = "";
    edad.value = "";
    rol.value = "";
    banco.value = "";
    pago.value = "";
}

// ================= LOGOUT =================
function logout() {
    localStorage.clear();
    window.location = "login.html";
}

// INIT
cargar();