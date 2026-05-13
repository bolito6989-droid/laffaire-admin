// ================= VARIABLES =================
const token = localStorage.getItem("token");

const userName =
    localStorage.getItem("user") || "admin";

const usuarioEl =
    document.getElementById("usuario");

const lista =
    document.getElementById("lista");

const nombre =
    document.getElementById("nombre");

const telefono =
    document.getElementById("telefono");

const edad =
    document.getElementById("edad");

const rol =
    document.getElementById("rol");

const banco =
    document.getElementById("banco");

const pago =
    document.getElementById("pago");

const total =
    document.getElementById("total");

const ingresos =
    document.getElementById("ingresos");

const comisiones =
    document.getElementById("comisiones");

const quitoCard =
    document.getElementById("quitoCard");

const guayaquilCard =
    document.getElementById("guayaquilCard");

usuarioEl.innerText = userName;

let editandoId = null;

// ================= AVATAR =================
const avatars = {

    admin: "/img/admin.jpg",

    abel: "/img/abel.jpg",

    daniel: "/img/daniel.jpg",

    emmanuel: "/img/emmanuel.jpg",

    david: "/img/1.jpg"
};

const avatarImg =
    document.getElementById("avatarImg");

if (avatarImg) {

    const key = userName.trim().toLowerCase();

    avatarImg.src =
        avatars[key] || "/img/default.jpg";
}

// ================= ADMIN =================
if (userName.toLowerCase() === "admin") {

    document.getElementById("adminActions")
        .style.display = "flex";

} else {

    quitoCard.style.display = "none";
    guayaquilCard.style.display = "none";
}

// ================= ENTER =================
document.addEventListener("keydown", function(e){

    if(e.key === "Enter"){
        agregar();
    }
});

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

    if (!data.nombre) {
        return alert("Ingrese nombre");
    }

    // EDITAR
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

        headers: {
            'Authorization': token
        }
    });

    const data = await res.json();

    lista.innerHTML = "";

    data.forEach(p => {

        lista.innerHTML += `
        <tr>

            <td>${p.nombre}</td>

            <td>$${p.pago || 0}</td>

            <td>${p.ciudad || "-"}</td>

            <td style="color:#d4af37;font-weight:600;">
                ${p.usuario || "-"}
            </td>

            <td>

                <button
                    onclick='editar(${p.id}, ${JSON.stringify(p)})'
                    style="
                    background:#2563eb;
                    color:white;
                    border:none;
                    padding:8px 12px;
                    border-radius:8px;
                    cursor:pointer;
                    margin-right:5px;
                    ">

                    Editar

                </button>

                <button
                    onclick="eliminar(${p.id})"
                    class="btn-delete">

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

        headers: {
            'Authorization': token
        }
    });

    const d = await res.json();

    total.innerText =
        "Total: " + (d.total || 0);

    ingresos.innerText =
        "Ingresos: $" + (d.ingresos || 0);

    comisiones.innerText =
        "Ganancia: $" + (d.comisiones || 0);

    quitoCard.innerText =
        "Quito: " + (d.quito || 0);

    guayaquilCard.innerText =
        "Guayaquil: " + (d.guayaquil || 0);
}

// ================= ELIMINAR =================
async function eliminar(id) {

    const ok = confirm(
        "¿Eliminar participante?"
    );

    if (!ok) return;

    await fetch('/participantes/' + id, {

        method: 'DELETE',

        headers: {
            'Authorization': token
        }
    });

    cargar();
}

// ================= ARCHIVAR EVENTO =================
async function archivarEvento() {

    const ok = confirm(
        "¿Archivar Evento 04 de Mayo?"
    );

    if (!ok) return;

    await fetch('/archivar-evento', {

        method: 'POST',

        headers: {
            'Authorization': token
        }
    });

    alert("Evento archivado");

    cargar();
}

// ================= VER HISTORIAL =================

async function verHistorial(){

    const res = await fetch('/historial', {

        headers:{
            'Authorization': token
        }

    });

    const data = await res.json();

    // CAMBIAR TITULO
    document.querySelector(".topbar h1")
    .innerText = "Historial de Eventos";

    document.querySelector(".topbar p")
    .innerText =
    "Evento archivado del 04 de Mayo";

    // LIMPIAR TABLA
    lista.innerHTML = "";

    // SI NO HAY DATA
    if(!data.length){

        lista.innerHTML = `
        <tr>

            <td colspan="5"
            style="
            text-align:center;
            padding:40px;
            color:#888;
            ">

            No existen eventos archivados

            </td>

        </tr>
        `;

        return;
    }

    // RENDER
    data.forEach(p => {

        lista.innerHTML += `

        <tr>

            <td>

                <div style="font-weight:700;">
                    ${p.nombre}
                </div>

                <div style="
                color:#777;
                font-size:13px;
                margin-top:5px;
                ">
                    ${p.telefono || ""}
                </div>

            </td>

            <td style="
            font-weight:700;
            color:#d4af37;
            ">
                $${p.pago}
            </td>

            <td>
                ${p.ciudad}
            </td>

            <td style="
            color:#d4af37;
            font-weight:700;
            ">
                ${p.usuario}
            </td>

            <td>

                <span style="
                padding:10px 16px;
                border-radius:12px;
                background:
                rgba(212,175,55,.12);

                border:
                1px solid rgba(212,175,55,.25);

                color:#d4af37;

                font-size:13px;
                font-weight:700;
                ">

                EVENTO ARCHIVADO

                </span>

            </td>

        </tr>

        `;
    });

    historialActivo = true;
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

    window.location = "index.html";
}

// ================= INIT =================
cargar();

// ================= TOGGLE HISTORIAL =================
let historialActivo = false;

async function toggleHistorial(){

    if(historialActivo){

        historialActivo = false;

        document.querySelector(".topbar h1")
        .innerText = "Dashboard Ejecutivo";

        document.querySelector(".topbar p")
        .innerText =
        "Sistema premium de administración";

        cargar();

        return;
    }

    verHistorial();
}