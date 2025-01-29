// Actualizar el contador del carrito en todas las páginas
function actualizarContadorCarrito() {
    const contadorCarrito = document.getElementById('contadorCarrito');
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    contadorCarrito.textContent = carrito.length;
}

// Llamar a la función para actualizar el contador del carrito cuando se carga la página
document.addEventListener('DOMContentLoaded', actualizarContadorCarrito);
