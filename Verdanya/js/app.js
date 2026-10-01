/* =========================================================
   VERDANYA
   PÁGINA DE INICIO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    iniciarInicio
);


/* =========================================================
   INICIO
========================================================= */

async function iniciarInicio() {

    const supabase =
        obtenerSupabase();

    if (!supabase) {

        mostrarErrorCategorias();
        mostrarErrorProductos();

        return;
    }

    await Promise.all([
        cargarCategoriasDestacadas(supabase),
        cargarProductosDestacados(supabase)
    ]);

}


/* =========================================================
   CATEGORÍAS DESTACADAS
========================================================= */

async function cargarCategoriasDestacadas(
    supabase
) {

    const contenedor =
        document.getElementById(
            "categorias-destacadas"
        );

    if (!contenedor) {
        return;
    }

    const {
        data,
        error
    } = await supabase
        .from("categorias")
        .select(
            "id,nombre,descripcion,imagen"
        )
        .eq("activo", true)
        .order(
            "nombre",
            {
                ascending: true
            }
        )
        .limit(4);

    if (error) {

        console.error(
            "Error cargando categorías:",
            error
        );

        mostrarErrorCategorias();

        return;
    }

    if (
        !data ||
        data.length === 0
    ) {

        contenedor.innerHTML = `
            <div class="sin-resultados">
                <h3>No hay categorías disponibles</h3>
                <p>
                    Actualmente no hay categorías
                    publicadas en Verdanya.
                </p>
            </div>
        `;

        return;
    }

    contenedor.innerHTML =
        data
            .map(
                crearTarjetaCategoria
            )
            .join("");

}


/* =========================================================
   TARJETA DE CATEGORÍA
========================================================= */

function crearTarjetaCategoria(
    categoria
) {

    const id =
        Number(categoria.id);

    const nombre =
        escaparHTML(
            categoria.nombre ||
            "Categoría"
        );

    const descripcion =
        escaparHTML(
            categoria.descripcion ||
            "Explora las plantas disponibles."
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
                    src="${imagen}"
                    alt="${escaparAtributo(nombre)}"
                    class="tarjeta-categoria-imagen"
                    loading="lazy"
                >
            `
            : `
                <div
                    class="tarjeta-categoria-imagen tarjeta-sin-imagen"
                >
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

            </div>

        </a>
    `;

}


/* =========================================================
   PRODUCTOS DESTACADOS
========================================================= */

async function cargarProductosDestacados(
    supabase
) {

    const contenedor =
        document.getElementById(
            "productos-destacados"
        );

    if (!contenedor) {
        return;
    }

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
            destacado
            `
        )
        .eq("activo", true)
        .eq("destacado", true)
        .order(
            "created_at",
            {
                ascending: false
            }
        )
        .limit(8);

    if (error) {

        console.error(
            "Error cargando productos:",
            error
        );

        mostrarErrorProductos();

        return;
    }

    if (
        !data ||
        data.length === 0
    ) {

        contenedor.innerHTML = `
            <div class="sin-resultados">
                <h3>No hay plantas destacadas</h3>
                <p>
                    Actualmente no hay plantas
                    destacadas disponibles.
                </p>
            </div>
        `;

        return;
    }

    contenedor.innerHTML =
        data
            .map(
                crearTarjetaProducto
            )
            .join("");

}


/* =========================================================
   TARJETA DE PRODUCTO
========================================================= */

function crearTarjetaProducto(
    producto
) {

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
                class="tarjeta-producto-imagen"
                loading="lazy"
            >
        `;

    } else {

        contenidoImagen = `
            <div
                class="tarjeta-producto-imagen tarjeta-sin-imagen"
            >
                🌱
            </div>
        `;

    }

    return `
        <article
            class="tarjeta-producto"
        >

            <a
                href="producto.html?slug=${slug}"
                class="tarjeta-producto-enlace"
            >

                ${
                    producto.destacado
                        ? `
                            <span
                                class="etiqueta-destacado"
                            >
                                Destacada
                            </span>
                        `
                        : ""
                }

                ${contenidoImagen}

            </a>

            <div
                class="tarjeta-producto-contenido"
            >

                <div
                    class="tarjeta-producto-categoria"
                >
                    ${categoria}
                </div>

                <h3
                    class="tarjeta-producto-titulo"
                >
                    ${nombre}
                </h3>

                <p
                    class="tarjeta-producto-descripcion"
                >
                    ${descripcion}
                </p>

                <div
                    class="tarjeta-producto-precio"
                >
                    ${precio}
                </div>

            </div>

        </article>
    `;

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
   ERROR CATEGORÍAS
========================================================= */

function mostrarErrorCategorias() {

    const contenedor =
        document.getElementById(
            "categorias-destacadas"
        );

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = `
        <div class="mensaje mensaje-error">
            No fue posible cargar las categorías.
        </div>
    `;

}


/* =========================================================
   ERROR PRODUCTOS
========================================================= */

function mostrarErrorProductos() {

    const contenedor =
        document.getElementById(
            "productos-destacados"
        );

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = `
        <div class="mensaje mensaje-error">
            No fue posible cargar las plantas destacadas.
        </div>
    `;

}


/* =========================================================
   SEGURIDAD
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


function escaparAtributo(
    valor
) {

    return escaparHTML(
        valor
    );

}