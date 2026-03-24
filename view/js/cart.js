// Carrito sencillo para principiantes
// Guarda los productos en localStorage y actualiza el contador y la vista del carrito.

const CART_KEY = "abp_cart";

function obtenerCarrito() {
    try {
        const guardado = localStorage.getItem(CART_KEY);
        const items = guardado ? JSON.parse(guardado) : [];
        return Array.isArray(items) ? items : [];
    } catch (error) {
        return [];
    }
}

function guardarCarrito(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    actualizarContador(items);
}

function actualizarContador(items = obtenerCarrito()) {
    let total = 0;
    items.forEach((item) => {
        total += item.qty || 0;
    });

    const badges = document.querySelectorAll(".abp_cart-count");
    badges.forEach((badge) => {
        badge.textContent = total;
        badge.hidden = total === 0;
    });
}

function formatearPrecio(valor) {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN"
    }).format(valor);
}

function agregarAlCarrito(producto) {
    const items = obtenerCarrito();
    let encontrado = null;

    items.forEach((item) => {
        if (item.id === producto.id) {
            encontrado = item;
        }
    });

    if (encontrado) {
        encontrado.qty += producto.qty;
    } else {
        items.push(producto);
    }

    guardarCarrito(items);
}

function manejarAgregarClick(event) {
    const boton = event.target.closest(".abp_add-to-cart");
    if (!boton) return;

    event.preventDefault();

    const producto = {
        id: boton.dataset.id,
        name: boton.dataset.name,
        price: Number(boton.dataset.price),
        img: boton.dataset.img,
        qty: 1
    };

    if (!producto.id || !producto.name || Number.isNaN(producto.price)) {
        return;
    }

    agregarAlCarrito(producto);

    // Mensaje breve para el usuario
    const textoOriginal = boton.textContent;
    boton.textContent = "Agregado";
    boton.classList.add("abp_btn--added");
    setTimeout(() => {
        boton.textContent = textoOriginal;
        boton.classList.remove("abp_btn--added");
    }, 1200);
}

function renderizarCarrito() {
    const paginaCarrito = document.querySelector("[data-cart-page]");
    if (!paginaCarrito) return;

    const contenedor = document.getElementById("cartItems");
    const estadoVacio = document.getElementById("cartEmpty");
    const subtotales = document.querySelectorAll("[data-cart-subtotal]");
    const totales = document.querySelectorAll("[data-cart-total]");
    const contadores = document.querySelectorAll("[data-cart-count]");

    function pintar() {
        const items = obtenerCarrito();
        let subtotal = 0;
        let cantidad = 0;

        items.forEach((item) => {
            subtotal += item.price * item.qty;
            cantidad += item.qty;
        });

        contadores.forEach((el) => (el.textContent = cantidad));
        subtotales.forEach((el) => (el.textContent = formatearPrecio(subtotal)));
        totales.forEach((el) => (el.textContent = formatearPrecio(subtotal)));

        if (items.length === 0) {
            if (estadoVacio) estadoVacio.hidden = false;
            if (contenedor) contenedor.innerHTML = "";
            return;
        }

        if (estadoVacio) estadoVacio.hidden = true;

        if (contenedor) {
            let html = "";
            items.forEach((item) => {
                html += `
                <article class="abp_cart-item" data-id="${item.id}">
                    <img class="abp_cart-item__img" src="${item.img}" alt="${item.name}">
                    <div class="abp_cart-item__info">
                        <h3>${item.name}</h3>
                        <p>${formatearPrecio(item.price)}</p>
                    </div>
                    <div class="abp_cart-item__qty">
                        <button class="abp_qty-btn" data-action="dec" aria-label="Disminuir cantidad">-</button>
                        <span class="abp_qty-value">${item.qty}</span>
                        <button class="abp_qty-btn" data-action="inc" aria-label="Aumentar cantidad">+</button>
                    </div>
                    <div class="abp_cart-item__total">${formatearPrecio(item.price * item.qty)}</div>
                    <button class="abp_cart-item__remove" data-action="remove">Quitar</button>
                </article>
                `;
            });
            contenedor.innerHTML = html;
        }
    }

    function cambiarCantidad(id, cambio) {
        const items = obtenerCarrito();
        let encontrado = null;

        items.forEach((item) => {
            if (item.id === id) {
                encontrado = item;
            }
        });

        if (!encontrado) return;

        encontrado.qty += cambio;
        if (encontrado.qty <= 0) {
            const index = items.findIndex((item) => item.id === id);
            if (index >= 0) items.splice(index, 1);
        }

        guardarCarrito(items);
        pintar();
    }

    if (contenedor) {
        contenedor.addEventListener("click", (event) => {
            const botonAccion = event.target.closest("[data-action]");
            if (!botonAccion) return;

            const itemCard = botonAccion.closest(".abp_cart-item");
            if (!itemCard) return;

            const id = itemCard.dataset.id;
            const accion = botonAccion.dataset.action;

            if (accion === "inc") {
                cambiarCantidad(id, 1);
            }

            if (accion === "dec") {
                cambiarCantidad(id, -1);
            }

            if (accion === "remove") {
                cambiarCantidad(id, -9999);
            }
        });
    }

    const botonVaciar = document.getElementById("cartClear");
    if (botonVaciar) {
        botonVaciar.addEventListener("click", () => {
            guardarCarrito([]);
            pintar();
        });
    }

    pintar();
}

document.addEventListener("click", manejarAgregarClick);
document.addEventListener("DOMContentLoaded", () => {
    actualizarContador();
    renderizarCarrito();
});
