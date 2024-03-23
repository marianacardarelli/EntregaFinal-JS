
function pedirDatosAlBackend() {
    fetch("./datos.json")
        .then(resp => resp.json())
        .then(info => principal(info))
        .catch(error => Swal.fire({
            title: 'Lo sentimos!',
            text: 'Algo salió mal, error: ' + error,
            icon: 'error',
            confirmButtonText: 'Aceptar'
        }))
}

pedirDatosAlBackend()

function principal(plantasArgentinas) {
    renderizarProductos(plantasArgentinas)
    renderizarCarrito()

    let input = document.getElementById("input")
    let inputEstacion = document.getElementById("estacion")

    let botonBuscar = document.getElementById("botonBuscar")
    botonBuscar.addEventListener("click", () => filtrarTarjetas(input, inputEstacion, plantasArgentinas))

    let botonComprar = document.getElementById("comprar")
    botonComprar.addEventListener("click", finalizarCompra)

    let botonEliminar = document.getElementById("eliminarCompra")
    botonEliminar.addEventListener("click", () => eliminarCarrito(plantasArgentinas))

    let botonVerOcultar = document.getElementById("verOcultarInfo")
    botonVerOcultar.addEventListener("click", verOcultarProductosCarrito)
}

function verOcultarProductosCarrito(e) {
    let seccionVenta = document.getElementById("seccionVenta")
    let seccionCarrito = document.getElementById("seccionCarrito")

    seccionVenta.classList.toggle("oculta")
    seccionCarrito.classList.toggle("oculta")

    let botonVerOcultar = document.getElementById("verOcultarInfo")

    if (seccionCarrito.classList.contains("oculta")) {
        botonVerOcultar.innerText = "Ver Carrito"
    } else {
        botonVerOcultar.innerText = "Ver Productos"
    }
}

function finalizarCompra() {
    Swal.fire("Gracias por su compra!\n" + "Vuelva pronto");
    localStorage.removeItem("carrito")
    renderizarCarrito()
    document.getElementById("totalPagar").textContent= 0
}

function eliminarCarrito(plantasArgentinas) {
    let carrito = obtenerCarrito()
    carrito.forEach(productoEnCarrito => {
        let productoEnStock = plantasArgentinas.find(producto => producto.id === productoEnCarrito.id)
        if (productoEnStock) {
            productoEnStock.stock += productoEnCarrito.unidades
        }
    })
    localStorage.removeItem("carrito")
    renderizarCarrito()
    document.getElementById("totalPagar").textContent= 0
}

function renderizarProductos(plantasArgentinas) {
    let contenedor = document.getElementById("productos")
    contenedor.innerHTML = ""
    plantasArgentinas.forEach(producto => {
        let tarjetaProd = document.createElement("div")
        tarjetaProd.className = "producto"

        tarjetaProd.innerHTML = `
        <img src="./media/${producto.rutaImagen}"/>
        <h3>${producto.nombre}</h3>
        <h4>Precio ${producto.precio}</h4>
        <p>Quedan ${producto.stock} unidades </p>
        <button id=${producto.id} class="agregarAlCarrito"> Agregar al carrito</button>
        `
        contenedor.append(tarjetaProd)
        let botonAgregarAlCarrito = document.getElementById(producto.id)
        botonAgregarAlCarrito.addEventListener("click", (e) => agregarAlCarrito(e, plantasArgentinas))
    })
}

function agregarAlCarrito(e, plantasArgentinas) {
    let carrito = obtenerCarrito()
    let idBotonProducto = (Number(e.target.id))
    let productoBuscado = plantasArgentinas.find(producto => producto.id === idBotonProducto)
    let productoEnCarrito = carrito.find(producto => producto.id === idBotonProducto)

    if (productoBuscado.stock > 0) {
        productoBuscado.stock--
        if (productoEnCarrito) {
            productoEnCarrito.unidades++
            productoEnCarrito.subtotal = productoEnCarrito.precioUnitario * productoEnCarrito.unidades
            Swal.fire({
                position: "bottom",
                icon: "success",
                title: "Agregamos un producto más",
                showConfirmButton: false,
                timer: 1000
            });
        } else {
            carrito.push({
                id: productoBuscado.id,
                nombre: productoBuscado.nombre,
                precioUnitario: productoBuscado.precio,
                unidades: 1,
                subtotal: productoBuscado.precio
            })
            Swal.fire({
                position: "bottom",
                icon: "success",
                title: "Producto agregado",
                showConfirmButton: false,
                timer: 1000
            });
        }
        localStorage.setItem("carrito", JSON.stringify(carrito))
        calcularTotal()
        renderizarCarrito()
        
        

    } else {
        Swal.fire({
            title: 'Lo sentimos!',
            text: 'No quedan mas unidades de este producto',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        })
    }
}

function renderizarCarrito() {
    let carrito = obtenerCarrito()
    let contenedor = document.getElementById("carrito")
    contenedor.innerHTML = ""

    carrito.forEach(producto => {
        let item = document.createElement("tr")
        item.innerText = producto.nombre + " " + producto.precioUnitario + " " + producto.unidades + " " + producto.subtotal
        item.innerHTML = `
        <td>${producto.nombre}</td>
        <td>${producto.precioUnitario}</td>
        <td>${producto.unidades}</td>
        <td>${producto.subtotal}</td>
        `
        contenedor.append(item)
    })
}

function calcularTotal() {
    let carrito= obtenerCarrito()
    let total= 0
    carrito.forEach(producto => {
        total += Number(producto.subtotal)
    })
    document.getElementById("totalPagar").textContent= total
}

function filtrarTarjetas(input, inputEstacion, plantasArgentinas) {
    let productosFiltrados

    let nombre = input.value
    let estacion = inputEstacion.value

    if (nombre || estacion) {

        if (nombre && estacion) {
            productosFiltrados = plantasArgentinas.filter(producto => producto.nombre.includes(nombre) && producto.epocaPlantacion.includes(estacion))

        } else if (nombre && !estacion) {
            productosFiltrados = productosFiltrados = plantasArgentinas.filter(producto => producto.nombre.includes(nombre))
        }

        else if (!nombre && estacion) {
            productosFiltrados = plantasArgentinas.filter(producto => producto.epocaPlantacion.includes(estacion))
        }
    }
    else {
        productosFiltrados = plantasArgentinas
    }
    renderizarProductos(productosFiltrados)
}

function obtenerCarrito() {
    let carrito = []
    if (localStorage.getItem("carrito")) {
        carrito = JSON.parse(localStorage.getItem("carrito"))
    }
    return carrito
}

