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

// Función para calcular el precio con descuento
function precioConDescuento(precio, descuento) {
    return (precio - (precio * descuento / 100)).toFixed(2);
}

// Función para actualizar el contador de productos en el carrito
function actualizarContadorCarrito() {
    const contadorCarrito = document.getElementById('contadorCarrito');
    if (contadorCarrito) {
        // Obtener el carrito desde localStorage en vez de utilizar la variable global 'carrito'
        const carritoGuardado = JSON.parse(localStorage.getItem('carrito')) || [];
        contadorCarrito.textContent = carritoGuardado.length; // Actualiza el contador con el número de productos en el carrito
    }
}

// Función para cargar los productos desde el archivo JSON
function cargarProductos() {
    fetch('./productos.json')  // Ruta del archivo JSON
        .then(response => response.json())  // Convertir la respuesta a JSON
        .then(data => {
            lista = data;  // Guardar los productos en la variable global 'lista'
            mostrarProductos();  // Llamar a la función para mostrar los productos
        })
        .catch(error => {
            console.error('Error al cargar los productos:', error);  // Manejo de errores
        });
}

// Llamamos a la función cargarProductos cuando la página cargue
window.onload = () => {
    cargarProductos();
    cargarCarrito();    // Cargar carrito al inicio de la página
    actualizarContadorCarrito();  // Aseguramos que el contador se actualice al cargar la página
};

// Función para mostrar los productos
function mostrarProductos() {
    const galeriaContainer = document.getElementById('galeriaContainer');
    galeriaContainer.innerHTML = ''; // Limpiar la galería antes de agregar productos

    lista.forEach(producto => {
        const div = document.createElement('div');
        div.classList.add('producto-item');
        div.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img">
            <p>${producto.nombre}</p>
            <p class="precio"><span class="precio-original">Precio original: $${producto.precio}</span></p>
            <p class="precio-con-descuento">Precio con descuento: $${precioConDescuento(producto.precio, producto.descuento)}</p>
            <button class="btnAgregarCarrito" data-id="${producto.id}">Agregar al carrito</button>
        `;

        // Evento para agregar al carrito
        const btnAgregarCarrito = div.querySelector('.btnAgregarCarrito');
        btnAgregarCarrito.onclick = function () {
            agregarAlCarrito(producto);  // Agregar el producto al carrito
        };

        galeriaContainer.appendChild(div);
    });

    // Llamar a la función actualizarContadorCarrito() cada vez que se carga la galería
    actualizarContadorCarrito();
}

// Función para agregar un producto al carrito
function agregarAlCarrito(producto) {
    // Obtenemos el carrito desde localStorage
    carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.push(producto);  // Agregar el producto al carrito

    // Guardar carrito actualizado en localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));

    // Mostrar la notificación de que el producto ha sido agregado
    SweetAlert.fire({
        title: 'Producto agregado',
        icon: 'success',
        iconColor:'darkviolet',
        text: 'El producto ha sido agregado al carrito.',
        confirmButtonText: 'Genial',
    });

    // Actualizar el contador de productos en el carrito
    actualizarContadorCarrito();

    // Actualizar el carrito
    cargarCarrito();
}

// Función para cargar el carrito desde localStorage y mostrar los productos en el carrito
function cargarCarrito() {
    // Recargamos el carrito desde localStorage
    carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    const carritoContainer = document.getElementById('contenedorCarrito');
    const totalCompraContainer = document.getElementById('totalCompra');
    carritoContainer.innerHTML = ''; // Limpiar el contenedor del carrito

    // Si el carrito está vacío, mostrar un mensaje
    if (carrito.length === 0) {
        carritoContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
        totalCompraContainer.innerHTML = '<p>Total de la compra: $0</p>';
    } else {
        let totalCompra = 0;  // Inicializamos el total a 0

        carrito.forEach(producto => {
            const divProducto = document.createElement('div');
            divProducto.classList.add('producto-carrito');
            divProducto.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img">
                <p>${producto.nombre}</p>
                <p>Precio original: $${producto.precio}</p>
                <p>Precio con descuento: $${precioConDescuento(producto.precio, producto.descuento)}</p>
                <button class="btnEliminarProducto" data-id="${producto.id}">Eliminar</button>
            `;

            // Agregar evento de eliminar producto
            const btnEliminar = divProducto.querySelector('.btnEliminarProducto');
            btnEliminar.onclick = function () {
                const productoId = parseInt(btnEliminar.getAttribute('data-id')); // Obtener el id del producto
                eliminarProductoDelCarrito(productoId); // Eliminar producto por id
            };

            // Agregar el precio con descuento al total
            totalCompra += parseFloat(precioConDescuento(producto.precio, producto.descuento));

            // Agregar el producto al contenedor
            carritoContainer.appendChild(divProducto);
        });

        // Actualizar el total de la compra
        totalCompraContainer.innerHTML = `<p>Total de la compra: ${formatearPrecioConComas(totalCompra)}</p>`;
    }

    // Actualizar el contador de productos del carrito cada vez que se carga el carrito
    actualizarContadorCarrito();
}

// Función para eliminar un producto del carrito
function eliminarProductoDelCarrito(productoId) {
    // Filtrar el producto a eliminar basándose en el ID
    carrito = carrito.filter(producto => producto.id !== productoId);

    // Actualizar carrito en localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));

    // Actualizar la vista del carrito
    cargarCarrito();

    // Actualizar el contador del carrito
    actualizarContadorCarrito();

    // Opcional: Mostrar mensaje de eliminación
    SweetAlert.fire({
        title: 'Producto eliminado',
        icon: 'warning',
        iconColor:'darkviolet',
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
    const textoBusqueda = event.target.value.toLowerCase(); // Obtener el texto ingresado
    const productosFiltrados = lista.filter(producto => {
        return producto.nombre.toLowerCase().includes(textoBusqueda) || 
               producto.categoria.toLowerCase().includes(textoBusqueda);
    });

    // Mostrar los productos filtrados
    mostrarProductosFiltrados(productosFiltrados);
}

// Función para mostrar los productos filtrados
function mostrarProductosFiltrados(productos) {
    const galeriaContainer = document.getElementById('galeriaContainer');
    galeriaContainer.innerHTML = ''; // Limpiar la galería antes de agregar los productos filtrados

    productos.forEach(producto => {
        const div = document.createElement('div');
        div.classList.add('producto-item');
        div.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img">
            <p>${producto.nombre}</p>
            <p class="precio"><span class="precio-original">Precio original: $${producto.precio}</span></p>
            <p class="precio-con-descuento">Precio con descuento: $${precioConDescuento(producto.precio, producto.descuento)}</p>
            <button class="btnAgregarCarrito" data-id="${producto.id}">Agregar al carrito</button>
        `;

        // Evento para agregar al carrito
        const btnAgregarCarrito = div.querySelector('.btnAgregarCarrito');
        btnAgregarCarrito.onclick = function () {
            agregarAlCarrito(producto);  // Agregar el producto al carrito
        };

        galeriaContainer.appendChild(div);
    });

    // Llamar a la función actualizarContadorCarrito() cada vez que se carga la galería
    actualizarContadorCarrito();
}

// Cargar productos y carrito al inicio
cargarProductos();
cargarCarrito();  // Aseguramos que el carrito se cargue correctamente al iniciar la página
actualizarContadorCarrito(); // Asegurarnos de que el contador se actualice correctamente al iniciar
