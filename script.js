// =======================================
// VARIABLES
// =======================================

const contenedorProductos = document.getElementById("contenedorProductos");
const buscador = document.getElementById("buscador");
const contadorCarrito = document.getElementById("contadorCarrito");

let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// =======================================
// CARGAR PRODUCTOS
// =======================================

async function cargarProductos(){

    try{

        contenedorProductos.innerHTML = `

<div class="text-center py-5">

    <div class="spinner-border text-danger" role="status">

        <span class="visually-hidden">Cargando...</span>

    </div>

    <p class="mt-3">

        Cargando productos...

    </p>

</div>

`;

        const respuesta = await fetch("productos.json");

productos = await respuesta.json();

productos.sort((a,b)=>a.price-b.price);

        mostrarProductos(productos);

    }

    catch(error){

        contenedorProductos.innerHTML = `

            <div class="col-12">

                <div class="alert alert-danger">

                    No fue posible cargar los productos.

                </div>

            </div>

        `;

        console.error(error);

    }

}

// =======================================
// MOSTRAR PRODUCTOS
// =======================================

function mostrarProductos(lista){

    contenedorProductos.innerHTML = "";

    lista.forEach(producto => {

        const columna = document.createElement("div");

        columna.className = "col-lg-4 col-md-6 fade-producto";

        columna.innerHTML = `

            <div class="card-producto">

                <img
                    src="${producto.thumbnail}"
                    alt="${producto.title}">

                <div class="card-body">

                    <h5>

                        ${producto.title}

                    </h5>

                    <p>

                        ${producto.description}

                    </p>

                    <div class="precio">

                        $ ${producto.price.toLocaleString("es-AR")}

                    </div>

                    <button
                        class="btn btn-pink agregarCarrito"
                        data-id="${producto.id}">

                        Agregar al carrito

                    </button>

                </div>

            </div>

        `;

        contenedorProductos.appendChild(columna);

    });

    document.getElementById("cantidadProductos").textContent=

`${lista.length} productos disponibles`;

}

// =======================================
// BUSCADOR
// =======================================

buscador.addEventListener("keyup", () => {

    const texto = buscador.value.toLowerCase();

    const resultado = productos.filter(producto =>

        producto.title.toLowerCase().includes(texto)

    );

    mostrarProductos(resultado);

});

const botonesFiltro = document.querySelectorAll(".filtro");

botonesFiltro.forEach(boton => {

    boton.addEventListener("click", () => {

        const categoria = boton.dataset.categoria;

        if(categoria === "all"){

            mostrarProductos(productos);

            return;

        }

        const filtrados = productos.filter(producto =>

            producto.category === categoria

        );

        mostrarProductos(filtrados);

    });

});

// =======================================
// AGREGAR AL CARRITO
// =======================================

contenedorProductos.addEventListener("click", e => {

    if(e.target.classList.contains("agregarCarrito")){

        const id = Number(e.target.dataset.id);

        agregarProducto(id);

    }

});

function agregarProducto(id){

    const producto = productos.find(p => p.id === id);

    const existe = carrito.find(p => p.id === id);

    if(existe){

        existe.cantidad++;

    }

    else{

        carrito.push({

            ...producto,

            cantidad:1

        });

    }

    guardarCarrito();

    actualizarContador();

    renderCarrito();

    const toast = new bootstrap.Toast(

document.getElementById("toastProducto")

);

document.querySelector("#toastProducto .toast-body").textContent=

`${producto.title} agregado al carrito`;

toast.show();

}

// =======================================
// LOCAL STORAGE
// =======================================

function guardarCarrito(){

    localStorage.setItem(

        "carrito",

        JSON.stringify(carrito)

    );

}

// =======================================
// CONTADOR
// =======================================

function actualizarContador(){

    const cantidad = carrito.reduce(

        (acum,producto)=>acum + producto.cantidad,

        0

    );

    contadorCarrito.textContent = cantidad;

}

// =======================================
// INICIO
// =======================================

cargarProductos();

actualizarContador();// =======================================
// ELEMENTOS DEL CARRITO
// =======================================

const itemsCarrito = document.getElementById("itemsCarrito");
const totalCarrito = document.getElementById("totalCarrito");
const btnVaciar = document.getElementById("vaciarCarrito");

// =======================================
// RENDER CARRITO
// =======================================

function renderCarrito() {

    if (carrito.length === 0) {

        itemsCarrito.innerHTML = `
            <p class="text-center">
                Tu carrito está vacío.
            </p>
        `;

        totalCarrito.textContent = "0";

        return;
    }

    itemsCarrito.innerHTML = "";

    carrito.forEach(producto => {

        const item = document.createElement("div");

        item.className = "item-carrito";

        item.innerHTML = `

            <div class="item-info">

                <img
                    src="${producto.thumbnail}"
                    alt="${producto.title}">

                <div>

                    <h5>${producto.title}</h5>

                    <p>$ ${producto.price}</p>

                </div>

            </div>

            <div class="controles">

                <button
                    class="restar"
                    data-id="${producto.id}">

                    -

                </button>

                <span>${producto.cantidad}</span>

                <button
                    class="sumar"
                    data-id="${producto.id}">

                    +

                </button>

                <button
                    class="eliminar btn btn-danger btn-sm"
                    data-id="${producto.id}">

                    <i class="bi bi-trash"></i>

                </button>

            </div>

        `;

        itemsCarrito.appendChild(item);

    });

    actualizarTotal();

}

// =======================================
// TOTAL
// =======================================

function actualizarTotal() {

    const total = carrito.reduce((acumulador, producto) => {

        return acumulador + (producto.price * producto.cantidad);

    }, 0);

    totalCarrito.textContent = total.toLocaleString("es-AR");

}

// =======================================
// EVENTOS DEL CARRITO
// =======================================

itemsCarrito.addEventListener("click", e => {

    const id = Number(e.target.dataset.id || e.target.parentElement.dataset.id);

    if (e.target.classList.contains("sumar")) {

        modificarCantidad(id, 1);

    }

    if (e.target.classList.contains("restar")) {

        modificarCantidad(id, -1);

    }

    if (
        e.target.classList.contains("eliminar") ||
        e.target.parentElement.classList.contains("eliminar")
    ) {

        eliminarProducto(id);

    }

});

// =======================================
// MODIFICAR CANTIDAD
// =======================================

function modificarCantidad(id, cambio) {

    const producto = carrito.find(p => p.id === id);

    if (!producto) return;

    producto.cantidad += cambio;

    if (producto.cantidad <= 0) {

        carrito = carrito.filter(p => p.id !== id);

    }

    guardarCarrito();

    actualizarContador();

    renderCarrito();

}

// =======================================
// ELIMINAR PRODUCTO
// =======================================

function eliminarProducto(id) {

    carrito = carrito.filter(p => p.id !== id);

    guardarCarrito();

    actualizarContador();

    renderCarrito();

}

// =======================================
// VACIAR CARRITO
// =======================================

btnVaciar.addEventListener("click", () => {

    if (carrito.length === 0) return;

    const confirmar = confirm("¿Deseás vaciar el carrito?");

    if (!confirmar) return;

    carrito = [];

    guardarCarrito();

    actualizarContador();

    renderCarrito();

});

//======================================
// VALIDACIÓN FORMULARIO
//======================================

const formulario = document.getElementById("formulario");
console.log(formulario);

const nombre = document.getElementById("nombre");
const email = document.getElementById("email");
const mensaje = document.getElementById("mensaje");

const errorNombre = document.getElementById("errorNombre");
const errorEmail = document.getElementById("errorEmail");
const errorMensaje = document.getElementById("errorMensaje");

const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

email.addEventListener("input", () => {

    if(email.value.trim() === ""){

        errorEmail.textContent = "";
        email.classList.remove("is-valid", "is-invalid");

    } else if(regexEmail.test(email.value)){

        errorEmail.textContent = "";
        email.classList.remove("is-invalid");
        email.classList.add("is-valid");

    } else {

        errorEmail.textContent = "Ingresá un email válido.";
        email.classList.remove("is-valid");
        email.classList.add("is-invalid");

    }

});

// ======================
// VALIDACIÓN EMAIL
// ======================
email.addEventListener("input", () => {

    if(email.value.trim() === ""){

        errorEmail.textContent = "";
        email.classList.remove("is-valid", "is-invalid");

    } else if(regexEmail.test(email.value)){

        errorEmail.textContent = "";
        email.classList.remove("is-invalid");
        email.classList.add("is-valid");

    } else {

        errorEmail.textContent = "Ingresá un email válido.";
        email.classList.remove("is-valid");
        email.classList.add("is-invalid");

    }

});

// ======================
// VALIDACIÓN NOMBRE
// ======================
nombre.addEventListener("input", () => {

    if(nombre.value.trim() === ""){

        errorNombre.textContent = "Ingresá tu nombre.";
        nombre.classList.remove("is-valid");
        nombre.classList.add("is-invalid");

    } else {

        errorNombre.textContent = "";
        nombre.classList.remove("is-invalid");
        nombre.classList.add("is-valid");

    }

});

// ======================
// VALIDACIÓN MENSAJE
// ======================
mensaje.addEventListener("input", () => {

    if(mensaje.value.trim().length < 10){

        errorMensaje.textContent = "El mensaje debe tener al menos 10 caracteres.";
        mensaje.classList.remove("is-valid");
        mensaje.classList.add("is-invalid");

    } else {

        errorMensaje.textContent = "";
        mensaje.classList.remove("is-invalid");
        mensaje.classList.add("is-valid");

    }

});

// ======================
// SUBMIT
// ======================
formulario.addEventListener("submit", function(e) {

    console.log("Entró al submit");

    e.preventDefault();

    errorNombre.textContent = "";
    errorEmail.textContent = "";
    errorMensaje.textContent = "";

    let formularioValido = true;


    //=====================
    // NOMBRE
    //=====================

    if(nombre.value.trim() === ""){

    errorNombre.textContent = "Ingresá tu nombre.";
    nombre.classList.add("is-invalid");
    formularioValido = false;

} else {

    nombre.classList.remove("is-invalid");
    nombre.classList.add("is-valid");

}
    

    //=====================
    // EMAIL
    //=====================

    if(!regexEmail.test(email.value)){

    errorEmail.textContent = "Ingresá un email válido.";
    email.classList.add("is-invalid");
    formularioValido = false;

} else {

    email.classList.remove("is-invalid");
    email.classList.add("is-valid");

}

    //=====================
    // MENSAJE
    //=====================

    if(mensaje.value.trim().length < 10){

    errorMensaje.textContent = "El mensaje debe tener al menos 10 caracteres.";
    mensaje.classList.add("is-invalid");
    formularioValido = false;

} else {

    mensaje.classList.remove("is-invalid");
    mensaje.classList.add("is-valid");

}

    //=====================
    // ENVIAR
    //=====================

    
    if(formularioValido){

        alert("Formulario enviado correctamente.");

        formulario.submit();

    };

    });
// =======================================
// RESTAURAR CARRITO
// =======================================

renderCarrito();

actualizarContador();

actualizarTotal();

buscador.value = "";