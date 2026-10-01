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
       Primero obtenemos la categoría
       enviada desde la URL.
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
       Esto permite seleccionar correctamente
       la categoría recibida por URL.
    */

    await cargarCategorias(supabase);


    /*
       Después cargamos los productos.
    */

    await cargarProductos(supabase);


    /*
       Finalmente aplicamos TODOS los filtros.
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

        .select(
            "id,nombre"
        )

        .eq(
            "activo",
            true
        )

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
       por la URL.
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

        .select(
            `
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
            created_at
            `
        )

        .eq(
            "activo",
            true
        )

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
               Si el usuario cambia manualmente
               la categoría, actualizamos la URL.
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
                            producto.nombre ||
                            ""
                        ).toLowerCase();


                    const descripcion =
                        (
                            producto.descripcion ||
                            ""
                        ).toLowerCase();


                    const categoria =
                        (
                            producto.categoria_nombre ||
                            ""
                        ).toLowerCase();


                    return (

                        nombre.includes(
                            textoBusqueda
                        )

                        ||

                        descripcion.includes(
                            textoBusqueda
                        )

                        ||

                        categoria.includes(
                            textoBusqueda
                        )

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
   TARJETA DE PRODUCTO
========================================================= */

function crearTarjetaProducto(producto) {

    const nombre =
        escaparHTML(
            producto.nombre ||
            "Planta"
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
            producto.slug
        );


    const precio =
        formatearPrecio(
            producto.precio
        );


    const mensajeWhatsApp =
        `Hola, Verdanya. Me interesa la planta ${producto.nombre || "disponible"}${producto.precio !== null && producto.precio !== undefined ? ` (C$${Number(producto.precio).toFixed(2)})` : ""}. ¿Está disponible?`;


    const enlaceWhatsApp =
        crearEnlaceWhatsApp(
            mensajeWhatsApp
        );


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


    return `

        <article class="tarjeta-producto">

            <a
                href="producto.html?slug=${slug}"
                class="tarjeta-producto-enlace"
            >

                ${contenidoImagen}

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


            <div class="tarjeta-producto-acciones">

                <a
                    href="${enlaceWhatsApp}"
                    class="boton boton-whatsapp boton-whatsapp-producto"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    💬 Pedir por WhatsApp
                </a>

            </div>

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