// Constructor para los productos (con descuento incluido)
const Producto = function (nombre, imagen, categoria, precio, id, descuento = 0) {
    this.nombre = nombre;
    this.imagen = imagen;
    this.categoria = categoria;
    this.precio = precio;
    this.id = id;
    this.descuento = descuento;  // Añadimos el descuento al producto (valor en porcentaje)
};

// Carrito almacenado en localStorage
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let tasaCambioUSD = 0;  // Variable para almacenar la tasa de cambio USD/ARS
let tasaCambioCargada = false;  // Para verificar si la tasa de cambio está cargada

// Función para obtener la tasa de cambio de USD a ARS
const apiKey = '20d8ce191e3255568641ebb8'; 
async function obtenerTasaCambio() {
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        tasaCambioUSD = data.conversion_rates.ARS;  // Guardamos la tasa de USD a ARS
        tasaCambioCargada = true;  // Marcamos que la tasa está cargada
        console.log(`Tasa de cambio obtenida: 1 USD = ${tasaCambioUSD} ARS`);
    } catch (error) {
        console.error('Error al obtener la tasa de cambio:', error);
        tasaCambioCargada = false;
    }
}

// Función para calcular el precio con descuento
function precioConDescuento(precio, descuento) {
    return (precio - (precio * descuento / 100)).toFixed(2);
}

// Función para actualizar el contador de productos en el carrito
function actualizarContadorCarrito() {
    const contadorCarrito = document.getElementById('contadorCarrito');
    if (contadorCarrito) {
        const carritoGuardado = JSON.parse(localStorage.getItem('carrito')) || [];
        contadorCarrito.textContent = carritoGuardado.length;
    }
}

// Función para cargar los productos desde el archivo JSON
function cargarProductos() {
    fetch('./productos.json')
        .then(response => response.json())
        .then(data => {
            lista = data;
            mostrarProductos();
        })
        .catch(error => {
            console.error('Error al cargar los productos:', error);
        });
}

// Llamamos a la función cargarProductos cuando la página cargue
window.onload = async () => {
    await obtenerTasaCambio();  // Esperamos a que la tasa de cambio se cargue
    cargarProductos();
    cargarCarrito();
    actualizarContadorCarrito();
};

// Función para mostrar los productos con el precio en ARS y USD
function mostrarProductos() {
    const galeriaContainer = document.getElementById('galeriaContainer');
    galeriaContainer.innerHTML = ''; // Limpiar la galería antes de agregar productos

    lista.forEach(producto => {
        const precioEnDolares = (producto.precio / tasaCambioUSD).toFixed(2);
        const precioConDescuentoDolares = (precioConDescuento(producto.precio, producto.descuento) / tasaCambioUSD).toFixed(2);

        const div = document.createElement('div');
        div.classList.add('producto-item');
        div.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img">
            <p>${producto.nombre}</p>
            <p class="precio"><span class="precio-original">Precio original: $${producto.precio} ARS / $${precioEnDolares} USD</span></p>
            <p class="precio-con-descuento">Precio con descuento: $${precioConDescuento(producto.precio, producto.descuento)} ARS / $${precioConDescuentoDolares} USD</p>
            <button class="btnAgregarCarrito" data-id="${producto.id}">Agregar al carrito</button>
        `;

        // Evento para agregar al carrito
        const btnAgregarCarrito = div.querySelector('.btnAgregarCarrito');
        btnAgregarCarrito.onclick = function () {
            agregarAlCarrito(producto);  // Agregar el producto al carrito
        };

        galeriaContainer.appendChild(div);
    });

    actualizarContadorCarrito();
}

// Función para agregar un producto al carrito
function agregarAlCarrito(producto) {
    carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.push(producto); 

    localStorage.setItem('carrito', JSON.stringify(carrito));

    SweetAlert.fire({
        title: 'Producto agregado',
        icon: 'success',
        iconColor: 'darkviolet',
        text: 'El producto ha sido agregado al carrito.',
        confirmButtonText: 'Genial',
    });

    actualizarContadorCarrito();
    cargarCarrito();
}

// Función para cargar el carrito desde localStorage y mostrar los productos en el carrito
function cargarCarrito() {
    carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    const carritoContainer = document.getElementById('contenedorCarrito');
    const totalCompraContainer = document.getElementById('totalCompra');
    carritoContainer.innerHTML = '';

    if (carrito.length === 0) {
        carritoContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
        totalCompraContainer.innerHTML = '<p>Total de la compra: $0 ARS / $0 USD</p>';
    } else {
        let totalCompra = 0;
        let totalCompraUSD = 0;

        carrito.forEach(producto => {
            const precioConDescuentoARS = parseFloat(precioConDescuento(producto.precio, producto.descuento));

            // Verificamos si la tasa de cambio está cargada antes de calcular el precio en dólares
            let precioConDescuentoUSD = 'Cargando...';
            if (tasaCambioCargada && tasaCambioUSD > 0) {
                precioConDescuentoUSD = (precioConDescuentoARS / tasaCambioUSD).toFixed(2);
            }

            const divProducto = document.createElement('div');
            divProducto.classList.add('producto-carrito');
            divProducto.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img">
                <p>${producto.nombre}</p>
                <p>Precio original: $${producto.precio} ARS / $${(producto.precio / tasaCambioUSD).toFixed(2)} USD</p>
                <p>Precio con descuento: $${precioConDescuentoARS} ARS / $${precioConDescuentoUSD} USD</p>
                <button class="btnEliminarProducto" data-id="${producto.id}">Eliminar</button>
            `;

            // Asociamos la eliminación del producto al botón
            const btnEliminarProducto = divProducto.querySelector('.btnEliminarProducto');
            btnEliminarProducto.onclick = function () {
                eliminarProductoDelCarrito(producto.id);  // Eliminamos el producto con el ID
            };

            totalCompra += precioConDescuentoARS;

            // Si la tasa de cambio está cargada, sumamos el precio en dólares
            if (tasaCambioCargada && tasaCambioUSD > 0) {
                totalCompraUSD += parseFloat(precioConDescuentoUSD);
            }

            carritoContainer.appendChild(divProducto);
        });

        // Si la tasa de cambio está cargada, mostramos el total en dólares
        let totalCompraUSDDisplay = 'Cargando...';
        if (tasaCambioCargada && tasaCambioUSD > 0) {
            totalCompraUSDDisplay = totalCompraUSD.toFixed(2);
        }

        totalCompraContainer.innerHTML = `<p>Total de la compra: $${formatearPrecioConComas(totalCompra)} ARS / $${totalCompraUSDDisplay} USD</p>`;
    }

    actualizarContadorCarrito();
}

// Función para eliminar un producto del carrito
function eliminarProductoDelCarrito(productoId) {
    carrito = carrito.filter(producto => producto.id !== productoId);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    cargarCarrito();
    actualizarContadorCarrito();

    SweetAlert.fire({
        title: 'Producto eliminado',
        icon: 'warning',
        iconColor: 'darkviolet',
        text: 'El producto ha sido eliminado del carrito.',
        confirmButtonText: 'Genial',
    });
}

// Función para formatear los precios con comas
function formatearPrecioConComas(precio) {
    return precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
}

// Escuchar el evento 'input' en el buscador para filtrar productos
document.getElementById('buscador').addEventListener('input', filtrarProductos);

// Función para filtrar productos según el texto ingresado
function filtrarProductos(event) {
    const textoBusqueda = event.target.value.toLowerCase();
    const productosFiltrados = lista.filter(producto => {
        return producto.nombre.toLowerCase().includes(textoBusqueda) ||
               producto.categoria.toLowerCase().includes(textoBusqueda);
    });

    mostrarProductosFiltrados(productosFiltrados);
}

// Función para mostrar los productos filtrados
function mostrarProductosFiltrados(productos) {
    const galeriaContainer = document.getElementById('galeriaContainer');
    galeriaContainer.innerHTML = ''; 

    productos.forEach(producto => {
        const div = document.createElement('div');
        div.classList.add('producto-item');
        div.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img">
            <p>${producto.nombre}</p>
            <p class="precio"><span class="precio-original">Precio original: $${producto.precio} ARS</span></p>
            <p class="precio-con-descuento">Precio con descuento: $${precioConDescuento(producto.precio, producto.descuento)} ARS</p>
            <button class="btnAgregarCarrito" data-id="${producto.id}">Agregar al carrito</button>
        `;

        const btnAgregarCarrito = div.querySelector('.btnAgregarCarrito');
        btnAgregarCarrito.onclick = function () {
            agregarAlCarrito(producto);  
        };

        galeriaContainer.appendChild(div);
    });

    actualizarContadorCarrito();
}

// Cargar productos y carrito al inicio
cargarProductos();
cargarCarrito();  
actualizarContadorCarrito();
