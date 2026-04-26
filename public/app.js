const userName = localStorage.getItem("user") || "admin";
document.getElementById("usuario").innerText = userName;

// AVATAR DINÁMICO
const avatars = {
    admin: "img/admin.jpg",
    abel: "img/abel.jpg",
    daniel: "img/daniel.jpg",
    emmanuel: "img/emmanuel.jpg"
};

document.getElementById("avatarImg").src =
    avatars[userName.toLowerCase()] || "img/default.jpg";

// ENTER
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") agregar();
});

// AGREGAR
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

    await fetch('/participantes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem("token")
        },
        body: JSON.stringify(data)
    });

    limpiar();
    cargar();
}

// LIMPIAR
function limpiar() {
    nombre.value = "";
    telefono.value = "";
    edad.value = "";
    rol.value = "";
    banco.value = "";
    pago.value = "";
}

// CARGAR
async function cargar() {

    const res = await fetch('/participantes', {
        headers: { 'Authorization': localStorage.getItem("token") }
    });

    const data = await res.json();

    const lista = document.getElementById("lista");
    lista.innerHTML = "";

    data.forEach(p => {

        lista.innerHTML += `
        <tr>
            <td>${p.nombre}</td>
            <td>${p.telefono || ""}</td>
            <td>$${p.pago || 0}</td>
            <td>
                <button class="btn-delete" onclick="eliminar(${p.id})">Eliminar</button>
            </td>
        </tr>
        `;
    });

    dashboard();
}

// DASHBOARD
async function dashboard() {

    const res = await fetch('/dashboard', {
        headers: { 'Authorization': localStorage.getItem("token") }
    });

    const d = await res.json();

    document.getElementById("total").innerText = "Total: " + d.total;
    document.getElementById("ingresos").innerText = "Ingresos: $" + d.ingresos;
    document.getElementById("comisiones").innerText = "Ganancia: $" + d.comisiones;
}

// ELIMINAR
async function eliminar(id) {
    await fetch('/participantes/' + id, {
        method: 'DELETE',
        headers: { 'Authorization': localStorage.getItem("token") }
    });
    cargar();
}

// LOGOUT
function logout() {
    localStorage.clear();
    window.location = "login.html";
}

// INIT
cargar();
setInterval(cargar, 4000);