
/* =========================================================
   VERDANYA
   CATÁLOGO DE PRODUCTOS
========================================================= */

let productosCatalogo = [];

let categoriaSeleccionada = "";

let textoBusqueda = "";


/* =========================================================
   INICIO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    iniciarCatalogo
);


async function iniciarCatalogo() {

    actualizarAnio();

    configurarWhatsApp();

    const supabase = obtenerSupabase();

    if (!supabase) {

        mostrarError(
            "No fue posible conectar con Verdanya."
        );

        return;
    }

    configurarBuscador();

    configurarFiltroCategoria();

    /*
       Obtenemos la categoría enviada
       desde la URL.
    */

    const parametros =
        new URLSearchParams(
            window.location.search
        );

    const categoriaURL =
        parametros.get("categoria");

    if (categoriaURL) {

        categoriaSeleccionada =
            String(categoriaURL);

    }

    /*
       Cargamos primero las categorías.
    */

    await cargarCategorias(supabase);

    /*
       Después cargamos los productos.
    */

    await cargarProductos(supabase);

    /*
       Finalmente aplicamos los filtros.
    */

    aplicarFiltros();

}


/* =========================================================
   AÑO ACTUAL
========================================================= */

function actualizarAnio() {

    const elemento =
        document.getElementById(
            "anio-actual"
        );

    if (!elemento) {
        return;
    }

    elemento.textContent =
        new Date().getFullYear();

}


/* =========================================================
   WHATSAPP GENERAL
========================================================= */

function configurarWhatsApp() {

    const boton =
        document.getElementById(
            "boton-whatsapp-general"
        );

    if (!boton) {
        return;
    }

    boton.href =
        crearEnlaceWhatsApp(
            VERDANYA_CONFIG.whatsapp.mensajeGeneral
        );

}


/* =========================================================
   CARGAR CATEGORÍAS
========================================================= */

async function cargarCategorias(supabase) {

    const {
        data,
        error
    } = await supabase
        .from("categorias")
        .select("id,nombre")
        .eq("activo", true)
        .order(
            "nombre",
            {
                ascending: true
            }
        );

    if (error) {

        console.error(
            "Error cargando categorías:",
            error
        );

        return;
    }

    const categorias =
        data || [];

    llenarFiltroCategorias(
        categorias
    );

}


/* =========================================================
   LLENAR FILTRO DE CATEGORÍAS
========================================================= */

function llenarFiltroCategorias(categorias) {

    const select =
        document.getElementById(
            "filtro-categoria"
        );

    if (!select) {
        return;
    }

    select.innerHTML = `
        <option value="">
            Todas las categorías
        </option>
    `;

    categorias.forEach(
        categoria => {

            const opcion =
                document.createElement(
                    "option"
                );

            opcion.value =
                String(categoria.id);

            opcion.textContent =
                categoria.nombre;

            select.appendChild(
                opcion
            );

        }
    );

    /*
       Aplicamos la categoría enviada
       por la URL, si existe.
    */

    if (categoriaSeleccionada) {

        const categoriaExiste =
            categorias.some(
                categoria =>
                    String(categoria.id) ===
                    String(categoriaSeleccionada)
            );

        if (categoriaExiste) {

            select.value =
                String(categoriaSeleccionada);

        } else {

            categoriaSeleccionada = "";

            select.value = "";

        }

    }

}


/* =========================================================
   CARGAR PRODUCTOS
========================================================= */

async function cargarProductos(supabase) {

    mostrarCarga();

    const {
        data,
        error
    } = await supabase
        .from("vista_catalogo")
        .select(`
            id,
            nombre,
            slug,
            descripcion,
            precio,
            categoria_id,
            categoria_nombre,
            imagen_principal,
            activo,
            destacado,
            estatus_comercial,
            created_at
        `)
        .eq("activo", true)
        .order(
            "created_at",
            {
                ascending: false
            }
        );

    if (error) {

        console.error(
            "Error cargando productos:",
            error
        );

        mostrarError(
            "No fue posible cargar las plantas."
        );

        return;
    }

    productosCatalogo =
        data || [];

}


/* =========================================================
   BUSCADOR
========================================================= */

function configurarBuscador() {

    const buscador =
        document.getElementById(
            "buscar-producto"
        );

    if (!buscador) {
        return;
    }

    buscador.addEventListener(
        "input",
        () => {

            textoBusqueda =
                buscador.value
                    .trim()
                    .toLowerCase();

            aplicarFiltros();

        }
    );

}


/* =========================================================
   FILTRO DE CATEGORÍA
========================================================= */

function configurarFiltroCategoria() {

    const select =
        document.getElementById(
            "filtro-categoria"
        );

    if (!select) {
        return;
    }

    select.addEventListener(
        "change",
        () => {

            categoriaSeleccionada =
                String(
                    select.value || ""
                );

            /*
               Actualizamos la URL cuando
               el usuario cambia la categoría.
            */

            const url =
                new URL(
                    window.location.href
                );

            if (categoriaSeleccionada) {

                url.searchParams.set(
                    "categoria",
                    categoriaSeleccionada
                );

            } else {

                url.searchParams.delete(
                    "categoria"
                );

            }

            window.history.replaceState(
                {},
                "",
                url
            );

            aplicarFiltros();

        }
    );

}


/* =========================================================
   APLICAR FILTROS
========================================================= */

function aplicarFiltros() {

    let productos =
        [...productosCatalogo];

    /*
       FILTRO DE TEXTO
    */

    if (textoBusqueda) {

        productos =
            productos.filter(
                producto => {

                    const nombre =
                        (
                            producto.nombre || ""
                        ).toLowerCase();

                    const descripcion =
                        (
                            producto.descripcion || ""
                        ).toLowerCase();

                    const categoria =
                        (
                            producto.categoria_nombre || ""
                        ).toLowerCase();

                    return (
                        nombre.includes(textoBusqueda) ||
                        descripcion.includes(textoBusqueda) ||
                        categoria.includes(textoBusqueda)
                    );

                }
            );

    }

    /*
       FILTRO DE CATEGORÍA
    */

    if (categoriaSeleccionada) {

        productos =
            productos.filter(
                producto => {

                    return String(
                        producto.categoria_id
                    ) === String(
                        categoriaSeleccionada
                    );

                }
            );

    }

    mostrarProductos(
        productos
    );

}


/* =========================================================
   MOSTRAR PRODUCTOS
========================================================= */

function mostrarProductos(productos) {

    const contenedor =
        document.getElementById(
            "lista-productos"
        );

    if (!contenedor) {
        return;
    }

    ocultarEstados();

    actualizarContador(
        productos.length
    );

    if (productos.length === 0) {

        contenedor.innerHTML = "";

        mostrarSinResultados();

        return;
    }

    contenedor.innerHTML =
        productos
            .map(
                crearTarjetaProducto
            )
            .join("");

}


/* =========================================================
   ESTADO COMERCIAL
========================================================= */

function obtenerEstadoComercial(producto) {

    /*
       Solo reconocemos los dos estados
       comerciales permitidos.

       Si falta el campo o contiene un valor
       inesperado, mostramos "Disponible"
       para mantener compatibilidad con
       registros antiguos. Conviene corregir
       esos registros en Supabase.
    */

    const estado =
        String(
            producto.estatus_comercial || ""
        ).trim().toLowerCase();

    if (estado === "vendida") {
        return "Vendida";
    }

    return "Disponible";

}


/* =========================================================
   TARJETA DE PRODUCTO
========================================================= */

function crearTarjetaProducto(producto) {

    const nombre =
        escaparHTML(
            producto.nombre || "Planta"
        );

    const descripcion =
        escaparHTML(
            producto.descripcion ||
            "Planta disponible en Verdanya."
        );

    const categoria =
        escaparHTML(
            producto.categoria_nombre ||
            "Plantas"
        );

    const slug =
        escaparAtributo(
            producto.slug || ""
        );

    const precio =
        formatearPrecio(
            producto.precio
        );

    const estadoComercial =
        obtenerEstadoComercial(
            producto
        );

    const estaDisponible =
        estadoComercial === "Disponible";

    /*
       Enlace a WhatsApp únicamente para
       las plantas disponibles.
    */

    let accionComercial = "";

    if (estaDisponible) {

        const nombreWhatsApp =
            producto.nombre || "la planta";

        const precioWhatsApp =
            producto.precio !== null &&
            producto.precio !== undefined &&
            producto.precio !== ""
                ? ` (C$${Number(producto.precio).toFixed(2)})`
                : "";

        const mensajeWhatsApp =
            `Hola, Verdanya. Me interesa la planta ${nombreWhatsApp}${precioWhatsApp}. ¿Está disponible?`;

        const enlaceWhatsApp =
            crearEnlaceWhatsApp(
                mensajeWhatsApp
            );

        accionComercial = `
            <div class="tarjeta-producto-acciones">
                <a
                    href="${escaparAtributo(enlaceWhatsApp)}"
                    class="boton boton-whatsapp boton-whatsapp-producto"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    💬 Consultar por WhatsApp
                </a>
            </div>
        `;

    } else {

        accionComercial = `
            <div class="tarjeta-producto-acciones">
                <span class="producto-no-disponible">
                    Esta planta ya fue vendida
                </span>
            </div>
        `;

    }

    /*
       Imagen de la planta.
    */

    let contenidoImagen;

    if (producto.imagen_principal) {

        contenidoImagen = `
            <img
                class="tarjeta-producto-imagen"
                src="${escaparAtributo(producto.imagen_principal)}"
                alt="${escaparAtributo(nombre)}"
                loading="lazy"
            >
        `;

    } else {

        contenidoImagen = `
            <div class="tarjeta-producto-imagen tarjeta-sin-imagen">
                🌱
            </div>
        `;

    }

    /*
       Etiqueta comercial visible.
    */

    const etiquetaComercial =
        estaDisponible
            ? `
                <span class="etiqueta-comercial etiqueta-disponible">
                    Disponible
                </span>
            `
            : `
                <span class="etiqueta-comercial etiqueta-vendida">
                    Vendida
                </span>
            `;

    return `
        <article class="tarjeta-producto">

            <a
                href="producto.html?slug=${slug}"
                class="tarjeta-producto-enlace"
                aria-label="Ver detalles de ${nombre}"
            >

                <div class="tarjeta-producto-imagen-contenedor">
                    ${contenidoImagen}
                    ${etiquetaComercial}
                </div>

                <div class="tarjeta-producto-contenido">

                    <span class="producto-categoria">
                        ${categoria}
                    </span>

                    <h3>
                        ${nombre}
                    </h3>

                    <p class="producto-descripcion-corta">
                        ${descripcion}
                    </p>

                    <span class="producto-precio">
                        ${precio}
                    </span>

                </div>

            </a>

            ${accionComercial}

        </article>
    `;

}


/* =========================================================
   PRECIO
========================================================= */

function formatearPrecio(precio) {

    if (
        precio === null ||
        precio === undefined ||
        precio === ""
    ) {

        return "Consultar";

    }

    const numero =
        Number(precio);

    if (Number.isNaN(numero)) {

        return "Consultar";

    }

    return `C$${numero.toFixed(2)}`;

}


/* =========================================================
   CONTADOR
========================================================= */

function actualizarContador(cantidad) {

    const contador =
        document.getElementById(
            "contador-productos"
        );

    if (!contador) {
        return;
    }

    const palabra =
        cantidad === 1
            ? "planta encontrada"
            : "plantas encontradas";

    contador.textContent =
        `${cantidad} ${palabra}`;

}


/* =========================================================
   ESTADO DE CARGA
========================================================= */

function mostrarCarga() {

    const carga =
        document.getElementById(
            "estado-carga"
        );

    const error =
        document.getElementById(
            "estado-error"
        );

    const vacio =
        document.getElementById(
            "estado-vacio"
        );

    if (carga) {
        carga.hidden = false;
    }

    if (error) {
        error.hidden = true;
    }

    if (vacio) {
        vacio.hidden = true;
    }

}


/* =========================================================
   SIN RESULTADOS
========================================================= */

function mostrarSinResultados() {

    const vacio =
        document.getElementById(
            "estado-vacio"
        );

    if (!vacio) {
        return;
    }

    const titulo =
        vacio.querySelector("h3");

    const texto =
        vacio.querySelector("p");

    if (titulo) {

        titulo.textContent =
            "No encontramos plantas";

    }

    if (texto) {

        texto.textContent =
            "Prueba con otra búsqueda o selecciona otra categoría.";

    }

    vacio.hidden = false;

}


/* =========================================================
   ERROR
========================================================= */

function mostrarError(mensaje) {

    const carga =
        document.getElementById(
            "estado-carga"
        );

    const error =
        document.getElementById(
            "estado-error"
        );

    const vacio =
        document.getElementById(
            "estado-vacio"
        );

    if (carga) {
        carga.hidden = true;
    }

    if (vacio) {
        vacio.hidden = true;
    }

    if (error) {

        error.hidden = false;

        error.textContent =
            mensaje;

    } else {

        const contenedor =
            document.getElementById(
                "lista-productos"
            );

        if (contenedor) {

            contenedor.innerHTML = `
                <div class="mensaje mensaje-error">
                    ${escaparHTML(mensaje)}
                </div>
            `;

        }

    }

}


/* =========================================================
   OCULTAR ESTADOS
========================================================= */

function ocultarEstados() {

    const carga =
        document.getElementById(
            "estado-carga"
        );

    const error =
        document.getElementById(
            "estado-error"
        );

    const vacio =
        document.getElementById(
            "estado-vacio"
        );

    if (carga) {
        carga.hidden = true;
    }

    if (error) {
        error.hidden = true;
    }

    if (vacio) {
        vacio.hidden = true;
    }

}


/* =========================================================
   SEGURIDAD HTML
========================================================= */

function escaparHTML(valor) {

    return String(valor)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


function escaparAtributo(valor) {

    return escaparHTML(valor);

}
