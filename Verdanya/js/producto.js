/* =========================================================
   VERDANYA
   PRODUCTO INDIVIDUAL
========================================================= */

let productoActual = null;

document.addEventListener(
    "DOMContentLoaded",
    iniciarProducto
);


/* =========================================================
   INICIO
========================================================= */

async function iniciarProducto() {

    actualizarAnio();

    configurarWhatsAppGeneral();

    const supabase =
        obtenerSupabase();

    if (!supabase) {

        mostrarErrorProducto(
            "No fue posible conectar con Verdanya."
        );

        return;
    }

    const slug =
        obtenerSlug();

    if (!slug) {

        mostrarProductoNoEncontrado();

        return;
    }

    await cargarProducto(
        supabase,
        slug
    );
}


/* =========================================================
   OBTENER SLUG
========================================================= */

function obtenerSlug() {

    const parametros =
        new URLSearchParams(
            window.location.search
        );

    return parametros.get("slug");
}


/* =========================================================
   CARGAR PRODUCTO
========================================================= */

async function cargarProducto(
    supabase,
    slug
) {

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
            created_at,
            updated_at
            `
        )
        .eq(
            "slug",
            slug
        )
        .eq(
            "activo",
            true
        )
        .maybeSingle();

    if (error) {

        console.error(
            "Error cargando producto:",
            error
        );

        mostrarErrorProducto(
            "No fue posible cargar la información de la planta."
        );

        return;
    }

    if (!data) {

        mostrarProductoNoEncontrado();

        return;
    }

    productoActual =
        data;

    mostrarProducto(
        data
    );
}


/* =========================================================
   MOSTRAR PRODUCTO
========================================================= */

function mostrarProducto(
    producto
) {

    const contenedor =
        document.getElementById(
            "producto-contenido"
        );

    if (!contenedor) {
        return;
    }


    /* =====================================================
       DATOS
    ===================================================== */

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

    const precio =
        formatearPrecio(
            producto.precio
        );

    const slug =
        escaparAtributo(
            producto.slug
        );


    /* =====================================================
       IMAGEN
    ===================================================== */

    let contenidoImagen;

    if (
        producto.imagen_principal
    ) {

        contenidoImagen = `
            <img
                src="${escaparAtributo(
                    producto.imagen_principal
                )}"
                alt="${escaparAtributo(
                    nombre
                )}"
                class="producto-imagen"
            >
        `;

    } else {

        contenidoImagen = `
            <div
                class="producto-imagen-placeholder"
            >
                🌱
            </div>
        `;
    }


    /* =====================================================
       WHATSAPP
    ===================================================== */

    const mensajeWhatsApp =
        `Hola, Verdanya. Me interesa la planta ${producto.nombre || "disponible"}${producto.precio !== null && producto.precio !== undefined ? ` (C$${Number(producto.precio).toFixed(2)})` : ""}. ¿Está disponible?`;

    const enlaceWhatsApp =
        crearEnlaceWhatsApp(
            mensajeWhatsApp
        );


    /* =====================================================
       HTML DEL PRODUCTO
    ===================================================== */

    contenedor.innerHTML = `

        <div
            class="producto-detalle-contenido"
        >

            <!-- IMAGEN -->

            <div
                class="producto-imagen-contenedor"
            >

                ${contenidoImagen}

            </div>


            <!-- INFORMACIÓN -->

            <div
                class="producto-informacion"
            >

                <span
                    class="producto-categoria"
                >
                    ${categoria}
                </span>


                <h1
                    class="producto-titulo"
                >
                    ${nombre}
                </h1>


                <div
                    class="producto-precio-detalle"
                >
                    ${precio}
                </div>


                <div
                    class="producto-descripcion"
                >
                    ${descripcion}
                </div>


                <!-- ACCIONES -->

                <div
                    class="producto-acciones"
                >

                    <a
                        href="${enlaceWhatsApp}"
                        class="boton boton-whatsapp"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        💬 Pedir por WhatsApp
                    </a>


                    <a
                        href="productos.html?categoria=${encodeURIComponent(
                            producto.categoria_id
                        )}"
                        class="boton boton-secundario"
                    >
                        ← Ver más plantas
                    </a>

                </div>

            </div>

        </div>
    `;


    /* =====================================================
       TÍTULO DEL NAVEGADOR
    ===================================================== */

    document.title =
        `${producto.nombre} | Verdanya`;
}


/* =========================================================
   FORMATO DE PRECIO
========================================================= */

function formatearPrecio(
    precio
) {

    if (
        precio === null ||
        precio === undefined ||
        precio === ""
    ) {

        return "Consultar";
    }

    const numero =
        Number(precio);

    if (
        Number.isNaN(numero)
    ) {

        return "Consultar";
    }

    return `C$${numero.toFixed(2)}`;
}


/* =========================================================
   WHATSAPP GENERAL
========================================================= */

function configurarWhatsAppGeneral() {

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
   PRODUCTO NO ENCONTRADO
========================================================= */

function mostrarProductoNoEncontrado() {

    const contenedor =
        document.getElementById(
            "producto-contenido"
        );

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = `

        <div
            class="producto-no-encontrado"
        >

            <h2>
                Planta no encontrada
            </h2>

            <p>
                La planta que buscas no está disponible
                o ya no se encuentra publicada.
            </p>

            <a
                href="productos.html"
                class="boton boton-principal"
            >
                Ver plantas
            </a>

        </div>
    `;
}


/* =========================================================
   ERROR DEL PRODUCTO
========================================================= */

function mostrarErrorProducto(
    mensaje
) {

    const contenedor =
        document.getElementById(
            "producto-contenido"
        );

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = `

        <div
            class="producto-no-encontrado"
        >

            <h2>
                Ocurrió un problema
            </h2>

            <p>
                ${escaparHTML(
                    mensaje
                )}
            </p>

            <a
                href="productos.html"
                class="boton boton-principal"
            >
                Volver al catálogo
            </a>

        </div>
    `;
}


/* =========================================================
   SEGURIDAD HTML
========================================================= */

function escaparHTML(
    valor
) {

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


/* =========================================================
   SEGURIDAD DE ATRIBUTOS
========================================================= */

function escaparAtributo(
    valor
) {

    return escaparHTML(
        valor
    );
}