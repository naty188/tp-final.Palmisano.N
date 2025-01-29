// Función para actualizar el contador del carrito en todas las páginas
function actualizarContadorCarrito() {
    const contadorCarrito = document.getElementById('contadorCarrito');
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    contadorCarrito.textContent = carrito.length; // Actualizamos el contador
    localStorage.setItem('carrito', JSON.stringify(carrito)); // Guardamos el carrito actualizado
}

// Llamar a la función para actualizar el contador del carrito cuando se carga la página
document.addEventListener('DOMContentLoaded', actualizarContadorCarrito);

// Función para agregar un producto al carrito
function agregarAlCarrito(producto) {
    // Si el carrito no existe, creamos uno vacío
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // Añadimos el producto al carrito
    carrito.push(producto);

    // Guardamos el carrito actualizado en el localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));

    // Actualizamos el contador del carrito
    actualizarContadorCarrito();

    // Actualizamos el total de la compra
    actualizarTotalCompra();
}

// Función para eliminar un producto del carrito
function eliminarProductoDelCarrito(productoId) {
    // Obtener carrito del localStorage
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // Filtrar el carrito para eliminar el producto con el id correspondiente
    carrito = carrito.filter(producto => producto.id !== productoId);

    // Guardamos el carrito actualizado en el localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));

    // Actualizamos el contador del carrito
    actualizarContadorCarrito();

    // Actualizamos el total de la compra
    actualizarTotalCompra();

    // Recargamos el carrito para reflejar los cambios
    cargarCarrito();
}

// Función para cargar los productos en el carrito
function cargarCarrito() {
    const carritoContainer = document.getElementById('contenedorCarrito');
    carritoContainer.innerHTML = ''; // Limpiar el contenedor antes de agregar productos

    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    if (carrito.length === 0) {
        carritoContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
    } else {
        carrito.forEach(producto => {
            const divProducto = document.createElement('div');
            divProducto.classList.add('producto-carrito');
            divProducto.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img">
                <p>${producto.nombre}</p>
                <p>Precio: $${producto.precio}</p>
                <button class="btnEliminarProducto">Eliminar</button>
            `;
            // Agregar evento de eliminar producto
            const btnEliminar = divProducto.querySelector('.btnEliminarProducto');
            btnEliminar.onclick = function() {
                eliminarProductoDelCarrito(producto.id); // Eliminar producto por id
            };
            carritoContainer.appendChild(divProducto);
        });
    }

    // Actualizar el total de la compra
    actualizarTotalCompra();
}

// Función para calcular el total de la compra
function actualizarTotalCompra() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const totalCompraSpan = document.getElementById('totalCompra');
    
    // Sumar los precios de los productos en el carrito
    const total = carrito.reduce((total, producto) => total + producto.precio, 0);

    // Mostrar el total en la interfaz
    totalCompraSpan.textContent = `$${total.toFixed(2)}`; // Asegurarse de mostrar con 2 decimales
}

// Función para mostrar todos los productos desde el archivo JSON
function cargarProductosDesdeAPI() {
    fetch('productos.json') // Cambiar la URL por la ruta correcta si es necesario
        .then(response => response.json())
        .then(data => {
            // Mostrar los productos cargados desde el JSON
            mostrarProductos(data);
        })
        .catch(error => {
            console.error('Error al cargar los productos:', error);
        });
}

// Función para manejar la compra
function realizarCompra() {
    // Verificar si SweetAlert está cargado correctamente
    if (typeof SweetAlert !== 'undefined') {
        // Mostrar un SweetAlert con el mensaje de agradecimiento
        SweetAlert.fire({
            title: '¡Gracias por tu compra!',
            text: 'Tu pedido ha sido recibido y está siendo procesado.',
            icon: 'success',
            iconColor:'darkviolet',
            confirmButtonText: 'Genial',
            
        }).then((result) => {
            if (result.isConfirmed) {
                // Opcional: Limpiar el carrito después de la compra
                localStorage.removeItem('carrito'); // Eliminar el carrito de localStorage
                carrito = []; // Vaciar el array del carrito

                // Volver a cargar el carrito para mostrar que está vacío
                cargarCarrito();

                // Actualizar el contador del carrito
                actualizarContadorCarrito();
            }
        });
    } else {
        console.error("SweetAlert no está cargado correctamente.");
    }
}

// Añadir el evento al botón "Comprar" para ejecutar la función
document.getElementById('btnComprar').addEventListener('click', realizarCompra);




// Función para mostrar los productos en la galería
function mostrarProductos(productos) {
    const galeriaContainer = document.getElementById('galeriaContainer');
    galeriaContainer.innerHTML = ''; // Limpiar la galería antes de agregar productos

    productos.forEach(producto => {
        const div = document.createElement('div');
        div.classList.add('producto-item');
        div.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img">
            <p>${producto.nombre}</p>
            <p>$${producto.precio}</p>
            <button id="btnAgregarCarrito"> Agregar al carrito </button>
        `;

        // Botón "Agregar al carrito"
        const btnAgregarCarrito = div.querySelector('#btnAgregarCarrito');
        btnAgregarCarrito.onclick = function() {
            agregarAlCarrito(producto); // Llamamos a la función para agregar al carrito
        };

        galeriaContainer.appendChild(div);
    });
}

// Cargar productos desde el archivo JSON al cargar la página
cargarProductosDesdeAPI();

// Llamar a la función para cargar el carrito cuando se carga la página
document.addEventListener('DOMContentLoaded', cargarCarrito);



// Código del botón del nav
const nav = document.querySelector("#nav");
const abrir = document.querySelector("#abrir");
const cerrar = document.querySelector("#cerrar");

abrir.addEventListener("click", () => {
    nav.classList.add("visible");
});

cerrar.addEventListener("click", () => {
    nav.classList.remove("visible");
});



// Iconos del nav
const iconosNav = document.querySelector(".nav-list");
