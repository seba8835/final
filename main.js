// Variable que mantiene el estado visible del carrito
let carritoVisible = false;

// Variable para almacenar el carrito en el LocalStorage
const carritoEnLocalStorage = "carrito";

// Esperamos a que todos los elementos de la página carguen para ejecutar el script
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ready);
} else {
  ready();
}

// Cargar los productos desde el archivo JSON
fetch("productos.json")
  .then((response) => response.json())
  .then((data) => {
    const productos = data.productos;

    // Traigo el elemento del DOM donde se cargan los productos
    const productosContainer = document.getElementById("productos-container");

    // Recorrido del array y creación de los elementos para mostrarlos
    productos.forEach((prod, index) => {
      let productoElement = document.createElement("div");
      productoElement.innerHTML = `
        <h2>${prod.producto}</h2>
        <p>${prod.precio}</p>
        <button data-index="${index}">Agregar</button>
        <img src="${prod.imagen}" alt="">
      `;

      const buttonClick = productoElement.querySelector("button");
      buttonClick.addEventListener("click", (event) => {
        // Lógica para agregar el producto al carrito utilizando el índice
        agregarAlCarritoClicked(event);
      });

      productosContainer.appendChild(productoElement);
    });
  })
  .catch((error) => {
    console.error("Error:", error);
  });

function ready() {
  const botonAgregar = document.getElementById("button");
  botonAgregar.addEventListener("click", () =>{
    const producto = document.getElementById("producto").value;
    const precio = document.getElementById("precio").value;
    agregarAlCarrito(producto, precio);
    guardarCarritoToLocalStorage();
  });

  recuperarCarritoFromLocalStorage();

  // Agregremos funcionalidad a los botones eliminar del carrito
  let botonesEliminarItem = document.getElementsByClassName("btn-eliminar");
  for (let i = 0; i < botonesEliminarItem.length; i++) {
    let button = botonesEliminarItem[i];
    button.addEventListener("click", eliminarItemCarrito);
  }

  // Agrego funcionalidad al botón sumar cantidad
  let botonesSumarCantidad = document.getElementsByClassName(
    "sumar-cantidad"
  );
  for (let i = 0; i < botonesSumarCantidad.length; i++) {
    let button = botonesSumarCantidad[i];
    button.addEventListener("click", sumarCantidad);
  }

  // Agrego funcionalidad al botón restar cantidad
  let botonesRestarCantidad = document.getElementsByClassName(
    "restar-cantidad"
  );
  for (let i = 0; i < botonesRestarCantidad.length; i++) {
    let button = botonesRestarCantidad[i];
    button.addEventListener("click", restarCantidad);
  }

  // Agregamos funcionalidad al botón Agregar al carrito
  let botonesAgregarAlCarrito = document.getElementsByClassName(
    "boton-item"
  );
  for (let i = 0; i < botonesAgregarAlCarrito.length; i++) {
    let button = botonesAgregarAlCarrito[i];
    button.addEventListener("click", agregarAlCarritoClicked);
  }

  // Agregamos funcionalidad al botón comprar
  document
    .getElementsByClassName("btn-pagar")[0]
    .addEventListener("click", pagarClicked);
}

// Eliminamos todos los elementos del carrito y lo ocultamos
function pagarClicked() {
  Swal.fire("Gracias por la compra");
  // Elimino todos los elementos del carrito
  let carritoItems = document.getElementsByClassName("carrito-items")[0];
  while (carritoItems.hasChildNodes()) {
    carritoItems.removeChild(carritoItems.firstChild);
  }
  actualizarTotalCarrito();
  ocultarCarrito();
}

// Función que controla el botón clickeado de agregar al carrito
function agregarAlCarritoClicked(event) {
  const button = event.target;
  const productoElement = button.parentElement;
  const producto = productoElement.querySelector("h2").textContent;
  const precio = productoElement.querySelector("p").textContent;
  const imagen = productoElement.querySelector("img").getAttribute("src");

  agregarAlCarrito(producto, precio, imagen);
  
  hacerVisibleCarrito();
}

function agregarAlCarrito(producto, precio) {
  const carritoContainer = document.getElementsByClassName(
    "carrito-items"
  )[0];
  const carritoItem = document.createElement("div");
  const carritoItemContenido = `
    <div class="carrito-item">
      <img src="${imagen}" alt="" class="carrito-imagen">
      <h3>${producto}</h3>
      <h4>${precio}</h4>
      <input type="number" value="1" class="carrito-cantidad">
      <button class="btn btn-danger btn-eliminar">Eliminar</button>
    </div>
  `;
  carritoItem.innerHTML = carritoItemContenido;
  carritoContainer.appendChild(carritoItem);

  // Agregamos funcionalidad al botón eliminar del nuevo item
  carritoItem
    .getElementsByClassName("btn-eliminar")[0]
    .addEventListener("click", eliminarItemCarrito);

  // Agregamos funcionalidad al input de cantidad del nuevo item
  carritoItem
    .getElementsByClassName("carrito-cantidad")[0]
    .addEventListener("change", cantidadCambiada);

  actualizarTotalCarrito();
}

// Función para eliminar un item del carrito
function eliminarItemCarrito(event) {
  const buttonClicked = event.target;
  buttonClicked.parentElement.parentElement.remove();
  actualizarTotalCarrito();
  guardarCarritoToLocalStorage();
}

// Función para actualizar el total del carrito
function actualizarTotalCarrito() {
  const carritoItemsContainer = document.getElementsByClassName(
    "carrito-items"
  )[0];
  const carritoItems = carritoItemsContainer.getElementsByClassName(
    "carrito-item"
  );
  let total = 0;
  for (let i = 0; i < carritoItems.length; i++) {
    const carritoItem = carritoItems[i];
    const precioElement = carritoItem.getElementsByClassName("precio")[0];
    const cantidadElement = carritoItem.getElementsByClassName(
      "carrito-cantidad"
    )[0];
    const precio = parseFloat(precioElement.innerText.replace("$", ""));
    const cantidad = cantidadElement.value;
    total = total + precio * cantidad;
  }
  document.getElementsByClassName("carrito-total-precio")[0].innerText =
    "$" + total.toFixed(2);
}

// Función para sumar la cantidad de un item en el carrito
function sumarCantidad(event) {
  const buttonClicked = event.target;
  const input = buttonClicked.parentElement.querySelector(".carrito-cantidad");
  let cantidad = parseInt(input.value);
  cantidad++;
  input.value = cantidad;
  actualizarTotalCarrito();
  guardarCarritoToLocalStorage();
}

// Función para restar la cantidad de un item en el carrito
function restarCantidad(event) {
  const buttonClicked = event.target;
  const input = buttonClicked.parentElement.querySelector(".carrito-cantidad");
  let cantidad = parseInt(input.value);
  if (cantidad > 1) {
    cantidad--;
    input.value = cantidad;
    actualizarTotalCarrito();
    guardarCarritoToLocalStorage();
  }
}

// Función para cambiar la cantidad de un item en el carrito
function cantidadCambiada(event) {
  const input = event.target;
  if (isNaN(input.value) || input.value <= 0) {
    input.value = 1;
  }
  actualizarTotalCarrito();
  guardarCarritoToLocalStorage();
}

// Función para hacer visible el carrito
function hacerVisibleCarrito() {
  const carrito = document.getElementsByClassName("carrito")[0];
  carrito.style.visibility = "visible";
  carritoVisible = true;
}

// Función para ocultar el carrito
function ocultarCarrito() {
  const carrito = document.getElementsByClassName("carrito")[0];
  carrito.style.visibility = "hidden";
  carritoVisible = false;
}

// Función para guardar el carrito en el LocalStorage
function guardarCarritoToLocalStorage() {
  const carritoItemsContainer = document.getElementsByClassName(
    "carrito-items"
  )[0];
  const carritoItems = carritoItemsContainer.getElementsByClassName(
    "carrito-item"
  );
  const carrito = [];
  for (let i = 0; i < carritoItems.length; i++) {
    const carritoItem = carritoItems[i];
    const producto = carritoItem.getElementsByTagName("h3")[0].innerText;
    const precio = carritoItem.getElementsByTagName("h4")[0].innerText;
    const imagen = carritoItem.getElementsByTagName("img")[0].getAttribute("src");
    const cantidad = carritoItem.getElementsByClassName(
      "carrito-cantidad"
    )[0].value;
    carrito.push({ producto, precio, imagen, cantidad });
  }
  localStorage.setItem(carritoEnLocalStorage, JSON.stringify(carrito));
}

// Función para recuperar el carrito desde el LocalStorage
function recuperarCarritoFromLocalStorage() {
  const carritoItemsContainer = document.getElementsByClassName(
    "carrito-items"
  )[0];
  const carritoEnLocalStorage = localStorage.getItem("carrito");

  if (carritoEnLocalStorage) {
    const carritoItems = JSON.parse(carritoEnLocalStorage);

    carritoItems.forEach((item) => {
      const { producto, precio, imagen, cantidad } = item;

      const carritoItem = document.createElement("div");
      carritoItem.classList.add("carrito-item");

      const carritoItemContent = `
        <img src="${imagen}" alt="${producto}" class="carrito-item-imagen">
        <div class="carrito-item-detalle">
          <h4 class="carrito-item-nombre">${producto}</h4>
          <p class="carrito-item-precio">$${precio}</p>
          <input type="number" min="1" value="${cantidad}" class="carrito-item-cantidad">
          <button class="btn btn-danger carrito-item-eliminar">Eliminar</button>
        </div>
      `;

      carritoItem.innerHTML = carritoItemContent;
      carritoItemsContainer.appendChild(carritoItem);
    });
  }
}







