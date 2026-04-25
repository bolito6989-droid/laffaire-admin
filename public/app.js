const token = localStorage.getItem("token");
const username = localStorage.getItem("username");

if (!token) window.location = "login.html";

// ================= MOSTRAR USER =================
if(username !== "admin"){
    document.querySelector(".topbar h2").innerText += " - " + username.toUpperCase();
}

// ================= ESTADO =================
function estado(p){
    if(p.pendiente == 0) return ["PAGADO","paid"];
    if(p.abono > 0) return ["ABONO","partial"];
    return ["PENDIENTE","pending"];
}

// ================= KPIs =================
async function cargarKPIs(){
    const res = await fetch('/dashboard',{
        headers:{Authorization:token}
    });

    const data = await res.json();

    totalPersonas.innerText = data.total || 0;
    totalDinero.innerText = "$"+(data.ingresos||0);
    pendientes.innerText = "$"+(data.pendiente||0);
}

// ================= LISTA =================
async function cargar(){

    const res = await fetch('/participantes',{
        headers:{Authorization:token}
    });

    const data = await res.json();

    tabla.innerHTML="";

    data.forEach((p,i)=>{

        const total = (p.pago||0)+(p.abono||0);
        const [txt,cl] = estado(p);

        tabla.innerHTML+=`
        <div class="list-item">
            <div>
                <b>${i+1}. ${p.nombre}</b><br>
                <small>${p.usuario}</small>
            </div>

            <div>$${total}</div>
            <div class="${cl}">${txt}</div>

            <div class="acciones">
                <button onclick="eliminar(${p.id})">🗑</button>
            </div>
        </div>
        `;
    });
}

// ================= CREAR =================
async function crear(){

    await fetch('/participantes',{
        method:'POST',
        headers:{
            'Content-Type':'application/json',
            Authorization:token
        },
        body: JSON.stringify({
            nombre:nombre.value,
            telefono:telefono.value,
            edad:edad.value,
            rol:rol.value,
            banco:banco.value,
            pago:pago.value
        })
    });

    document.querySelectorAll("input").forEach(i=>i.value="");

    cargar();
    cargarKPIs();
}

// ================= ELIMINAR =================
async function eliminar(id){

    if(!confirm("Eliminar?")) return;

    await fetch('/participantes/'+id,{
        method:'DELETE',
        headers:{Authorization:token}
    });

    cargar();
    cargarKPIs();
}

cargar();
cargarKPIs();
// ================= LOGOUT =================
function logout(){
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location = "login.html";
}