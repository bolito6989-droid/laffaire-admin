// ================= VARIABLES =================
const token = localStorage.getItem("token");
const userName = localStorage.getItem("user") || "admin";

const usuarioEl = document.getElementById("usuario");
const lista = document.getElementById("lista");

const nombre = document.getElementById("nombre");
const telefono = document.getElementById("telefono");
const edad = document.getElementById("edad");
const rol = document.getElementById("rol");
const banco = document.getElementById("banco");
const pago = document.getElementById("pago");

const total = document.getElementById("total");
const ingresos = document.getElementById("ingresos");
const comisiones = document.getElementById("comisiones");

usuarioEl.innerText = userName;

let editandoId = null;

// ================= AVATAR =================
// ================= AVATAR =================
const avatarImg = document.getElementById("avatarImg");

const avatars = {
    admin: "/img/admin.jpg",
    abel: "/img/abel.jpg",
    daniel: "/img/daniel.jpg",
    emmanuel: "/img/emmanuel.jpg"
};

if (avatarImg) {
    const key = userName.trim().toLowerCase();

    console.log("USER:", key); // DEBUG

    avatarImg.src = avatars[key] || "/img/default.jpg";
}

// ================= AGREGAR / EDITAR =================
async function agregar() {

    const data = {
        nombre: nombre.value.trim(),
        telefono: telefono.value.trim(),
        edad: edad.value.trim(),
        rol: rol.value.trim(),
        banco: banco.value.trim(),
        pago: parseFloat(pago.value) || 0
    };

    if (!data.nombre) return alert("Ingrese nombre");

    if (editandoId) {

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
function editar(id, p) {

    nombre.value = p.nombre || "";
    telefono.value = p.telefono || "";
    edad.value = p.edad || "";
    rol.value = p.rol || "";
    banco.value = p.banco || "";
    pago.value = p.pago || 0;

    editandoId = id;
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
            <td>${p.telefono || ""}</td>
            <td>$${p.pago || 0}</td>
            <td style="color:#d4af37;font-weight:600;">
                ${p.usuario || "-"}
            </td>
            <td>
                <button onclick='editar(${p.id}, ${JSON.stringify(p)})'
                    style="background:#3b82f6;color:white;border:none;padding:6px 10px;margin-right:5px;border-radius:6px;">
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

    total.innerText = "Total: " + (d.total || 0);
    ingresos.innerText = "Ingresos: $" + (d.ingresos || 0);
    comisiones.innerText = "Ganancia: $" + (d.comisiones || 0);
}

// ================= ELIMINAR =================
async function eliminar(id) {

    if (!confirm("¿Eliminar participante?")) return;

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

// ================= INIT =================
cargar();