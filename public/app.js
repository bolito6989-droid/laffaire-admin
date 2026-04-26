// ================= USUARIO =================
const userName = localStorage.getItem("user") || "admin";
const token = localStorage.getItem("token") || "";

document.getElementById("usuario").innerText = userName;

// ================= AVATAR DINÁMICO =================
const avatars = {
    admin: "img/admin.jpg",
    abel: "img/abel.jpg",
    daniel: "img/daniel.jpg",
    emmanuel: "img/emmanuel.jpg"
};

const avatarImg = document.getElementById("avatarImg");
avatarImg.src = avatars[userName.toLowerCase()] || "img/default.jpg";

// ================= ENTER =================
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") agregar();
});

// ================= AGREGAR =================
async function agregar() {

    const data = {
        nombre: document.getElementById("nombre").value.trim(),
        telefono: document.getElementById("telefono").value.trim(),
        edad: document.getElementById("edad").value.trim(),
        rol: document.getElementById("rol").value.trim(),
        banco: document.getElementById("banco").value.trim(),
        pago: parseFloat(document.getElementById("pago").value) || 0
    };

    if (!data.nombre) {
        alert("Ingrese nombre");
        return;
    }

    try {
        await fetch('/participantes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(data)
        });

        limpiar();
        cargar();

    } catch (err) {
        console.error("Error al agregar:", err);
    }
}

// ================= LIMPIAR =================
function limpiar() {
    document.getElementById("nombre").value = "";
    document.getElementById("telefono").value = "";
    document.getElementById("edad").value = "";
    document.getElementById("rol").value = "";
    document.getElementById("banco").value = "";
    document.getElementById("pago").value = "";
}

// ================= CARGAR PARTICIPANTES =================
async function cargar() {

    try {
        const res = await fetch('/participantes', {
            headers: { 'Authorization': token }
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
                <td style="color:#d4af37;font-weight:600;">
                    ${p.usuario || "-"}
                </td>
                <td>
                    <button class="btn-delete" onclick="eliminar(${p.id})">
                        Eliminar
                    </button>
                </td>
            </tr>
            `;
        });

        dashboard();

    } catch (err) {
        console.error("Error al cargar:", err);
    }
}

// ================= DASHBOARD =================
async function dashboard() {

    try {
        const res = await fetch('/dashboard', {
            headers: { 'Authorization': token }
        });

        const d = await res.json();

        document.getElementById("total").innerText =
            "Total: " + (d.total || 0);

        document.getElementById("ingresos").innerText =
            "Ingresos: $" + (d.ingresos || 0);

        document.getElementById("comisiones").innerText =
            "Ganancia: $" + (d.comisiones || 0);

    } catch (err) {
        console.error("Error dashboard:", err);
    }
}

// ================= ELIMINAR =================
async function eliminar(id) {

    if (!confirm("¿Eliminar participante?")) return;

    try {
        await fetch('/participantes/' + id, {
            method: 'DELETE',
            headers: { 'Authorization': token }
        });

        cargar();

    } catch (err) {
        console.error("Error eliminar:", err);
    }
}

// ================= LOGOUT =================
function logout() {
    localStorage.clear();
    window.location = "login.html";
}

// ================= INIT =================
cargar();

// Actualización automática cada 5 segundos
setInterval(cargar, 5000);