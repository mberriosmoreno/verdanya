/* =========================================================
   VERDANYA
   CATEGORÍAS
========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    iniciarCategorias
);


/* =========================================================
   INICIO
========================================================= */

async function iniciarCategorias() {

    actualizarAnio();

    configurarWhatsApp();

    const supabase = obtenerSupabase();

    if (!supabase) {

        mostrarEstadoError();

        return;

    }

    await cargarCategorias(supabase);

}


/* =========================================================
   AÑO ACTUAL
========================================================= */

function actualizarAnio() {

    const elemento =
        document.getElementById("anio-actual");

    if (!elemento) {
        return;
    }

    elemento.textContent =
        new Date().getFullYear();

}


/* =========================================================
   WHATSAPP
========================================================= */

function configurarWhatsApp() {

    const boton =
        document.getElementById(
            "boton-whatsapp-general"
        );

    if (!boton) {
        return;
    }

    const mensaje =
        VERDANYA_CONFIG.whatsapp.mensajeGeneral;

    boton.href =
        crearEnlaceWhatsApp(mensaje);

}


/* =========================================================
   CARGAR CATEGORÍAS
========================================================= */

async function cargarCategorias(supabase) {

    mostrarEstadoCarga();

    const {
        data,
        error
    } = await supabase

        .from("categorias")

        .select(
            "id,nombre,descripcion,imagen,activo,created_at"
        )

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

        mostrarEstadoError();

        return;

    }


    const categorias =
        data || [];


    if (categorias.length === 0) {

        mostrarEstadoVacio();

        return;

    }


    mostrarCategorias(categorias);

}


/* =========================================================
   MOSTRAR CATEGORÍAS
========================================================= */

function mostrarCategorias(categorias) {

    const contenedor =
        document.getElementById(
            "lista-categorias"
        );

    if (!contenedor) {
        return;
    }


    contenedor.innerHTML =
        categorias
            .map(crearTarjetaCategoria)
            .join("");


    actualizarContador(
        categorias.length
    );


    ocultarEstados();

}


/* =========================================================
   TARJETA DE CATEGORÍA
========================================================= */

function crearTarjetaCategoria(categoria) {

    const id =
        Number(categoria.id);

    const nombre =
        escaparHTML(
            categoria.nombre || "Categoría"
        );

    const descripcion =
        escaparHTML(
            categoria.descripcion ||
            "Explora las plantas disponibles en esta categoría."
        );


    const imagen =
        categoria.imagen
            ? escaparAtributo(
                categoria.imagen
            )
            : "";


    const contenidoImagen =
        imagen

            ? `
                <img
                    class="tarjeta-categoria-imagen"
                    src="${imagen}"
                    alt="${escaparAtributo(nombre)}"
                    loading="lazy"
                >
            `

            : `
                <div class="tarjeta-categoria-imagen tarjeta-sin-imagen">
                    🌿
                </div>
            `;


    return `

        <a
            href="productos.html?categoria=${id}"
            class="tarjeta-categoria tarjeta-categoria-enlace"
        >

            ${contenidoImagen}

            <div class="tarjeta-categoria-contenido">

                <h3>
                    ${nombre}
                </h3>

                <p>
                    ${descripcion}
                </p>

                <span class="tarjeta-categoria-ver">
                    Ver plantas →
                </span>

            </div>

        </a>

    `;

}


/* =========================================================
   CONTADOR
========================================================= */

function actualizarContador(cantidad) {

    const contador =
        document.getElementById(
            "contador-categorias"
        );

    if (!contador) {
        return;
    }


    const palabra =
        cantidad === 1
            ? "categoría"
            : "categorías";


    contador.textContent =
        `${cantidad} ${palabra} disponibles`;

}


/* =========================================================
   ESTADOS
========================================================= */

function mostrarEstadoCarga() {

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


function mostrarEstadoError() {

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
        error.hidden = false;
    }

    if (vacio) {
        vacio.hidden = true;
    }

}


function mostrarEstadoVacio() {

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
        vacio.hidden = false;
    }

}


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

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}


function escaparAtributo(valor) {

    return escaparHTML(valor);

}