/* =========================================================
   VERDANYA
   ADMINISTRACIÓN
========================================================= */

const BUCKET_IMAGENES = "Plantas";
const MAX_TAMANO_IMAGEN = 5 * 1024 * 1024;

let productoEditandoId = null;
let categoriaEditandoId = null;

let categoriasAdminCache = [];
let productosAdminCache = [];


/* =========================================================
   INICIO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    iniciarAdministracion
);


async function iniciarAdministracion() {

    const supabase = obtenerSupabase();

    if (!supabase) {

        mostrarMensajeAdmin(
            "No se pudo conectar con Supabase.",
            "error"
        );

        return;
    }


    const {
        data: { session }
    } = await supabase.auth.getSession();


    if (!session) {

        window.location.href = "login.html";

        return;
    }


    mostrarUsuario(session);

    configurarEventos();

    await cargarDatosAdministracion();
}


/* =========================================================
   USUARIO
========================================================= */

function mostrarUsuario(session) {

    const elemento =
        document.getElementById("usuario-correo");

    if (!elemento) return;


    elemento.textContent =
        session.user.email || "Usuario autenticado";
}


/* =========================================================
   EVENTOS
========================================================= */

function configurarEventos() {

    document
        .getElementById("boton-cerrar-sesion")
        ?.addEventListener(
            "click",
            cerrarSesion
        );


    document
        .getElementById("boton-nueva-categoria")
        ?.addEventListener(
            "click",
            abrirNuevaCategoria
        );


    document
        .getElementById("boton-nuevo-producto")
        ?.addEventListener(
            "click",
            abrirNuevoProducto
        );


    document
        .getElementById("formulario-categoria")
        ?.addEventListener(
            "submit",
            guardarCategoria
        );


    document
        .getElementById("formulario-producto")
        ?.addEventListener(
            "submit",
            guardarProducto
        );


    document
        .querySelectorAll("[data-cerrar-modal]")
        .forEach(boton => {

            boton.addEventListener(
                "click",
                () => {

                    cerrarModal(
                        boton.dataset.cerrarModal
                    );

                }
            );

        });


    document
        .querySelectorAll(".modal-admin")
        .forEach(modal => {

            modal.addEventListener(
                "click",
                evento => {

                    if (
                        evento.target === modal
                    ) {

                        cerrarModal(
                            modal.id
                        );

                    }

                }
            );

        });
}


/* =========================================================
   CARGA GENERAL
========================================================= */

async function cargarDatosAdministracion() {

    await cargarCategoriasAdmin();

    await cargarProductosAdmin();

    actualizarResumen();

    llenarSelectCategorias();
}


/* =========================================================
   CATEGORÍAS
========================================================= */

async function cargarCategoriasAdmin() {

    const supabase = obtenerSupabase();

    const contenedor =
        document.getElementById(
            "lista-categorias-admin"
        );


    if (!contenedor) return;


    contenedor.innerHTML =
        `<div class="admin-cargando">
            Cargando categorías...
        </div>`;


    const {
        data,
        error
    } = await supabase
        .from("categorias")
        .select("*")
        .order("nombre", {
            ascending: true
        });


    if (error) {

        console.error(
            "Error cargando categorías:",
            error
        );


        contenedor.innerHTML =
            `<div class="admin-error">
                No se pudieron cargar las categorías.
            </div>`;

        return;
    }


    categoriasAdminCache = data || [];

    renderizarCategoriasAdmin();
}


function renderizarCategoriasAdmin() {

    const contenedor =
        document.getElementById(
            "lista-categorias-admin"
        );


    if (!contenedor) return;


    if (!categoriasAdminCache.length) {

        contenedor.innerHTML =
            `<div class="admin-vacio">
                No hay categorías registradas.
            </div>`;

        return;
    }


    contenedor.innerHTML = `

        <table class="admin-tabla">

            <thead>

                <tr>

                    <th>Nombre</th>

                    <th>Descripción</th>

                    <th>Estado</th>

                    <th>Acciones</th>

                </tr>

            </thead>

            <tbody>

                ${categoriasAdminCache.map(categoria => `

                    <tr>

                        <td>
                            <strong class="admin-producto-nombre">
                                ${escaparHTML(categoria.nombre)}
                            </strong>
                        </td>

                        <td>
                            ${escaparHTML(
                                categoria.descripcion || "—"
                            )}
                        </td>

                        <td>

                            <span class="admin-estado ${
                                categoria.activo
                                    ? "activo"
                                    : "inactivo"
                            }">

                                ${
                                    categoria.activo
                                        ? "Activa"
                                        : "Inactiva"
                                }

                            </span>

                        </td>

                        <td>

                            <div class="admin-acciones">

                                <button
                                    type="button"
                                    class="admin-accion"
                                    data-editar-categoria="${categoria.id}"
                                >
                                    Editar
                                </button>

                                <button
                                    type="button"
                                    class="admin-accion"
                                    data-toggle-categoria="${categoria.id}"
                                >
                                    ${
                                        categoria.activo
                                            ? "Desactivar"
                                            : "Activar"
                                    }
                                </button>

                                <button
                                    type="button"
                                    class="admin-accion eliminar"
                                    data-eliminar-categoria="${categoria.id}"
                                >
                                    Eliminar
                                </button>

                            </div>

                        </td>

                    </tr>

                `).join("")}

            </tbody>

        </table>
    `;


    contenedor
        .querySelectorAll(
            "[data-editar-categoria]"
        )
        .forEach(boton => {

            boton.addEventListener(
                "click",
                () => {

                    editarCategoria(
                        Number(
                            boton.dataset.editarCategoria
                        )
                    );

                }
            );

        });


    contenedor
        .querySelectorAll(
            "[data-toggle-categoria]"
        )
        .forEach(boton => {

            boton.addEventListener(
                "click",
                () => {

                    cambiarEstadoCategoria(
                        Number(
                            boton.dataset.toggleCategoria
                        )
                    );

                }
            );

        });


    contenedor
        .querySelectorAll(
            "[data-eliminar-categoria]"
        )
        .forEach(boton => {

            boton.addEventListener(
                "click",
                () => {

                    eliminarCategoria(
                        Number(
                            boton.dataset.eliminarCategoria
                        )
                    );

                }
            );

        });
}


/* =========================================================
   NUEVA CATEGORÍA
========================================================= */

function abrirNuevaCategoria() {

    categoriaEditandoId = null;


    document
        .getElementById(
            "titulo-modal-categoria"
        )
        .textContent = "Nueva categoría";


    document
        .getElementById(
            "formulario-categoria"
        )
        .reset();


    document
        .getElementById(
            "categoria-activa"
        )
        .checked = true;


    document
        .getElementById(
            "categoria-id"
        )
        .value = "";


    abrirModal("modal-categoria");
}


/* =========================================================
   EDITAR CATEGORÍA
========================================================= */

function editarCategoria(id) {

    const categoria =
        categoriasAdminCache.find(
            item => item.id === id
        );


    if (!categoria) return;


    categoriaEditandoId = id;


    document
        .getElementById(
            "titulo-modal-categoria"
        )
        .textContent = "Editar categoría";


    document
        .getElementById(
            "categoria-id"
        )
        .value = categoria.id;


    document
        .getElementById(
            "categoria-nombre"
        )
        .value = categoria.nombre || "";


    document
        .getElementById(
            "categoria-descripcion"
        )
        .value = categoria.descripcion || "";


    document
        .getElementById(
            "categoria-activa"
        )
        .checked = Boolean(
            categoria.activo
        );


    abrirModal("modal-categoria");
}


/* =========================================================
   GUARDAR CATEGORÍA
========================================================= */

async function guardarCategoria(evento) {

    evento.preventDefault();


    const supabase = obtenerSupabase();


    const nombre =
        document
            .getElementById(
                "categoria-nombre"
            )
            .value
            .trim();


    const descripcion =
        document
            .getElementById(
                "categoria-descripcion"
            )
            .value
            .trim();


    const activo =
        document
            .getElementById(
                "categoria-activa"
            )
            .checked;


    if (!nombre) {

        mostrarMensajeAdmin(
            "El nombre de la categoría es obligatorio.",
            "error"
        );

        return;
    }


    const datos = {

        nombre,

        descripcion:
            descripcion || null,

        activo

    };


    let resultado;


    if (categoriaEditandoId) {

        resultado = await supabase
            .from("categorias")
            .update(datos)
            .eq("id", categoriaEditandoId);

    } else {

        resultado = await supabase
            .from("categorias")
            .insert(datos);

    }


    if (resultado.error) {

        console.error(
            "Error guardando categoría:",
            resultado.error
        );


        mostrarMensajeAdmin(
            traducirErrorAdmin(
                resultado.error,
                "No se pudo guardar la categoría."
            ),
            "error"
        );

        return;
    }


    cerrarModal("modal-categoria");


    mostrarMensajeAdmin(
        categoriaEditandoId
            ? "Categoría actualizada correctamente."
            : "Categoría creada correctamente.",
        "exito"
    );


    categoriaEditandoId = null;


    await cargarDatosAdministracion();
}


/* =========================================================
   CAMBIAR ESTADO CATEGORÍA
========================================================= */

async function cambiarEstadoCategoria(id) {

    const categoria =
        categoriasAdminCache.find(
            item => item.id === id
        );


    if (!categoria) return;


    const supabase = obtenerSupabase();


    const { error } =
        await supabase
            .from("categorias")
            .update({
                activo: !categoria.activo
            })
            .eq("id", id);


    if (error) {

        mostrarMensajeAdmin(
            traducirErrorAdmin(
                error,
                "No se pudo cambiar el estado."
            ),
            "error"
        );

        return;
    }


    mostrarMensajeAdmin(
        categoria.activo
            ? "Categoría desactivada."
            : "Categoría activada.",
        "exito"
    );


    await cargarDatosAdministracion();
}


/* =========================================================
   ELIMINAR CATEGORÍA
========================================================= */

async function eliminarCategoria(id) {

    const categoria =
        categoriasAdminCache.find(
            item => item.id === id
        );


    if (!categoria) return;


    const confirmar =
        confirm(
            `¿Eliminar la categoría "${categoria.nombre}"?\n\n` +
            `Solo será posible si no existen productos asociados.`
        );


    if (!confirmar) return;


    const supabase = obtenerSupabase();


    const { error } =
        await supabase
            .from("categorias")
            .delete()
            .eq("id", id);


    if (error) {

        console.error(
            "Error eliminando categoría:",
            error
        );


        mostrarMensajeAdmin(
            "No se pudo eliminar la categoría. " +
            "Comprueba que no tenga productos asociados.",
            "error"
        );

        return;
    }


    mostrarMensajeAdmin(
        "Categoría eliminada correctamente.",
        "exito"
    );


    await cargarDatosAdministracion();
}


/* =========================================================
   PRODUCTOS
========================================================= */

async function cargarProductosAdmin() {

    const supabase = obtenerSupabase();


    const contenedor =
        document.getElementById(
            "lista-productos-admin"
        );


    if (!contenedor) return;


    contenedor.innerHTML =
        `<div class="admin-cargando">
            Cargando productos...
        </div>`;


    const {
        data,
        error
    } = await supabase
        .from("productos")
        .select(`
            *,
            categorias (
                nombre
            )
        `)
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(
            "Error cargando productos:",
            error
        );


        contenedor.innerHTML =
            `<div class="admin-error">
                No se pudieron cargar los productos.
            </div>`;

        return;
    }


    productosAdminCache = data || [];

    renderizarProductosAdmin();
}


function renderizarProductosAdmin() {

    const contenedor =
        document.getElementById(
            "lista-productos-admin"
        );


    if (!contenedor) return;


    if (!productosAdminCache.length) {

        contenedor.innerHTML =
            `<div class="admin-vacio">
                No hay productos registrados.
            </div>`;

        return;
    }


    contenedor.innerHTML = `

        <table class="admin-tabla">

            <thead>

                <tr>

                    <th>Producto</th>

                    <th>Categoría</th>

                    <th>Precio</th>

                    <th>Estado</th>

                    <th>Acciones</th>

                </tr>

            </thead>

            <tbody>

                ${productosAdminCache.map(producto => `

                    <tr>

                        <td>

                            <strong class="admin-producto-nombre">
                                ${escaparHTML(producto.nombre)}
                            </strong>

                            <span class="admin-producto-slug">
                                /${escaparHTML(producto.slug)}
                            </span>

                        </td>

                        <td>
                            ${escaparHTML(
                                producto.categorias?.nombre ||
                                "Sin categoría"
                            )}
                        </td>

                        <td class="admin-precio">
                            ${formatearPrecio(producto.precio)}
                        </td>

                        <td>

                            <span class="admin-estado ${
                                producto.activo
                                    ? "activo"
                                    : "inactivo"
                            }">

                                ${
                                    producto.activo
                                        ? "Activo"
                                        : "Inactivo"
                                }

                            </span>

                            ${
                                producto.destacado
                                    ? `
                                        <span class="admin-estado destacado">
                                            Destacado
                                        </span>
                                      `
                                    : ""
                            }

                        </td>

                        <td>

                            <div class="admin-acciones">

                                <button
                                    type="button"
                                    class="admin-accion"
                                    data-editar-producto="${producto.id}"
                                >
                                    Editar
                                </button>

                                <button
                                    type="button"
                                    class="admin-accion"
                                    data-toggle-producto="${producto.id}"
                                >
                                    ${
                                        producto.activo
                                            ? "Desactivar"
                                            : "Activar"
                                    }
                                </button>

                                <button
                                    type="button"
                                    class="admin-accion eliminar"
                                    data-eliminar-producto="${producto.id}"
                                >
                                    Eliminar
                                </button>

                            </div>

                        </td>

                    </tr>

                `).join("")}

            </tbody>

        </table>
    `;


    contenedor
        .querySelectorAll(
            "[data-editar-producto]"
        )
        .forEach(boton => {

            boton.addEventListener(
                "click",
                () => {

                    editarProducto(
                        Number(
                            boton.dataset.editarProducto
                        )
                    );

                }
            );

        });


    contenedor
        .querySelectorAll(
            "[data-toggle-producto]"
        )
        .forEach(boton => {

            boton.addEventListener(
                "click",
                () => {

                    cambiarEstadoProducto(
                        Number(
                            boton.dataset.toggleProducto
                        )
                    );

                }
            );

        });


    contenedor
        .querySelectorAll(
            "[data-eliminar-producto]"
        )
        .forEach(boton => {

            boton.addEventListener(
                "click",
                () => {

                    eliminarProducto(
                        Number(
                            boton.dataset.eliminarProducto
                        )
                    );

                }
            );

        });
}


/* =========================================================
   NUEVO PRODUCTO
========================================================= */

function abrirNuevoProducto() {

    productoEditandoId = null;


    document
        .getElementById(
            "titulo-modal-producto"
        )
        .textContent = "Nuevo producto";


    document
        .getElementById(
            "formulario-producto"
        )
        .reset();


    document
        .getElementById(
            "producto-id"
        )
        .value = "";


    document
        .getElementById(
            "producto-activo"
        )
        .checked = true;


    document
        .getElementById(
            "producto-destacado"
        )
        .checked = false;


    document
        .getElementById(
            "producto-imagen-actual"
        )
        .innerHTML = "";


    llenarSelectCategorias();


    abrirModal("modal-producto");
}


/* =========================================================
   EDITAR PRODUCTO
========================================================= */

function editarProducto(id) {

    const producto =
        productosAdminCache.find(
            item => item.id === id
        );


    if (!producto) return;


    productoEditandoId = id;


    document
        .getElementById(
            "titulo-modal-producto"
        )
        .textContent = "Editar producto";


    document
        .getElementById(
            "producto-id"
        )
        .value = producto.id;


    document
        .getElementById(
            "producto-nombre"
        )
        .value = producto.nombre || "";


    document
        .getElementById(
            "producto-slug"
        )
        .value = producto.slug || "";


    document
        .getElementById(
            "producto-precio"
        )
        .value =
            producto.precio ?? "";


    llenarSelectCategorias();


    document
        .getElementById(
            "producto-categoria"
        )
        .value =
            producto.categoria_id || "";


    document
        .getElementById(
            "producto-descripcion"
        )
        .value =
            producto.descripcion || "";


    document
        .getElementById(
            "producto-activo"
        )
        .checked =
            Boolean(producto.activo);


    document
        .getElementById(
            "producto-destacado"
        )
        .checked =
            Boolean(producto.destacado);


    const imagenActual =
        document.getElementById(
            "producto-imagen-actual"
        );


    if (producto.imagen_principal) {

        imagenActual.innerHTML = `

            <p>
                Imagen actual:
            </p>

            <img
                src="${escaparAtributo(
                    producto.imagen_principal
                )}"
                alt="${escaparAtributo(
                    producto.nombre
                )}"
            >

        `;

    } else {

        imagenActual.innerHTML = "";
    }


    document
        .getElementById(
            "producto-imagen"
        )
        .value = "";


    abrirModal("modal-producto");
}


/* =========================================================
   LLENAR CATEGORÍAS
========================================================= */

function llenarSelectCategorias() {

    const select =
        document.getElementById(
            "producto-categoria"
        );


    if (!select) return;


    const valorActual = select.value;


    select.innerHTML = `

        <option value="">
            Selecciona una categoría
        </option>

        ${categoriasAdminCache
            .filter(categoria => categoria.activo)
            .map(categoria => `

                <option value="${categoria.id}">
                    ${escaparHTML(categoria.nombre)}
                </option>

            `)
            .join("")
        }

    `;


    if (valorActual) {

        select.value = valorActual;
    }
}


/* =========================================================
   GUARDAR PRODUCTO
========================================================= */

async function guardarProducto(evento) {

    evento.preventDefault();


    const supabase = obtenerSupabase();


    const nombre =
        document
            .getElementById(
                "producto-nombre"
            )
            .value
            .trim();


    const slug =
        document
            .getElementById(
                "producto-slug"
            )
            .value
            .trim();


    const precioValor =
        document
            .getElementById(
                "producto-precio"
            )
            .value;


    const categoriaId =
        document
            .getElementById(
                "producto-categoria"
            )
            .value;


    const descripcion =
        document
            .getElementById(
                "producto-descripcion"
            )
            .value
            .trim();


    const activo =
        document
            .getElementById(
                "producto-activo"
            )
            .checked;


    const destacado =
        document
            .getElementById(
                "producto-destacado"
            )
            .checked;


    const archivo =
        document
            .getElementById(
                "producto-imagen"
            )
            .files[0];


    if (!nombre || !slug || !categoriaId) {

        mostrarMensajeAdmin(
            "Completa nombre, slug y categoría.",
            "error"
        );

        return;
    }


    if (
        precioValor !== "" &&
        Number(precioValor) < 0
    ) {

        mostrarMensajeAdmin(
            "El precio no puede ser negativo.",
            "error"
        );

        return;
    }


    if (archivo) {

        if (
            archivo.size >
            MAX_TAMANO_IMAGEN
        ) {

            mostrarMensajeAdmin(
                "La imagen no puede superar los 5 MB.",
                "error"
            );

            return;
        }


        const tiposPermitidos = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];


        if (
            !tiposPermitidos.includes(
                archivo.type
            )
        ) {

            mostrarMensajeAdmin(
                "La imagen debe ser JPG, PNG o WebP.",
                "error"
            );

            return;
        }
    }


    const datos = {

        nombre,

        slug,

        descripcion:
            descripcion || null,

        precio:
            precioValor === ""
                ? null
                : Number(precioValor),

        categoria_id:
            Number(categoriaId),

        activo,

        destacado

    };


    let productoId =
        productoEditandoId;


    if (productoEditandoId) {

        const { error } =
            await supabase
                .from("productos")
                .update(datos)
                .eq(
                    "id",
                    productoEditandoId
                );


        if (error) {

            console.error(
                "Error actualizando producto:",
                error
            );


            mostrarMensajeAdmin(
                traducirErrorAdmin(
                    error,
                    "No se pudo actualizar el producto."
                ),
                "error"
            );

            return;
        }

    } else {

        const {
            data,
            error
        } = await supabase
            .from("productos")
            .insert(datos)
            .select("id")
            .single();


        if (error) {

            console.error(
                "Error creando producto:",
                error
            );


            mostrarMensajeAdmin(
                traducirErrorAdmin(
                    error,
                    "No se pudo crear el producto."
                ),
                "error"
            );

            return;
        }


        productoId = data.id;
    }


    /*
     * Si el usuario seleccionó una imagen,
     * la subimos después de guardar el producto.
     */

    if (archivo && productoId) {

        const urlImagen =
            await subirImagenProducto(
                archivo,
                productoId
            );


        if (!urlImagen) {

            return;
        }


        const {
            error: errorImagen
        } = await supabase
            .from("productos")
            .update({
                imagen_principal: urlImagen
            })
            .eq(
                "id",
                productoId
            );


        if (errorImagen) {

            console.error(
                "Error guardando URL de imagen:",
                errorImagen
            );


            mostrarMensajeAdmin(
                "El producto se guardó, pero no se pudo asociar la imagen.",
                "error"
            );

        }
    }


    cerrarModal("modal-producto");


    mostrarMensajeAdmin(
        productoEditandoId
            ? "Producto actualizado correctamente."
            : "Producto creado correctamente.",
        "exito"
    );


    productoEditandoId = null;


    await cargarDatosAdministracion();
}


/* =========================================================
   SUBIR IMAGEN
========================================================= */

async function subirImagenProducto(
    archivo,
    productoId
) {

    const supabase = obtenerSupabase();


    const extension =
        obtenerExtensionImagen(
            archivo.name
        );


    const nombreArchivo =
        `${crypto.randomUUID()}.${extension}`;


    const ruta =
        `productos/${productoId}/${nombreArchivo}`;


    const {
        error
    } = await supabase
        .storage
        .from(BUCKET_IMAGENES)
        .upload(
            ruta,
            archivo,
            {
                cacheControl: "3600",
                upsert: false,
                contentType: archivo.type
            }
        );


    if (error) {

        console.error(
            "Error subiendo imagen:",
            error
        );


        mostrarMensajeAdmin(
            "No se pudo subir la imagen.",
            "error"
        );

        return null;
    }


    const {
        data
    } = supabase
        .storage
        .from(BUCKET_IMAGENES)
        .getPublicUrl(ruta);


    return data.publicUrl;
}


/* =========================================================
   CAMBIAR ESTADO PRODUCTO
========================================================= */

async function cambiarEstadoProducto(id) {

    const producto =
        productosAdminCache.find(
            item => item.id === id
        );


    if (!producto) return;


    const supabase = obtenerSupabase();


    const { error } =
        await supabase
            .from("productos")
            .update({
                activo: !producto.activo
            })
            .eq("id", id);


    if (error) {

        mostrarMensajeAdmin(
            traducirErrorAdmin(
                error,
                "No se pudo cambiar el estado."
            ),
            "error"
        );

        return;
    }


    mostrarMensajeAdmin(
        producto.activo
            ? "Producto desactivado."
            : "Producto activado.",
        "exito"
    );


    await cargarDatosAdministracion();
}


/* =========================================================
   ELIMINAR PRODUCTO
========================================================= */

async function eliminarProducto(id) {

    const producto =
        productosAdminCache.find(
            item => item.id === id
        );


    if (!producto) return;


    const confirmar =
        confirm(
            `¿Eliminar "${producto.nombre}"?\n\n` +
            `Esta acción eliminará el producto del catálogo.`
        );


    if (!confirmar) return;


    const supabase = obtenerSupabase();


    const { error } =
        await supabase
            .from("productos")
            .delete()
            .eq("id", id);


    if (error) {

        console.error(
            "Error eliminando producto:",
            error
        );


        mostrarMensajeAdmin(
            "No se pudo eliminar el producto.",
            "error"
        );

        return;
    }


    mostrarMensajeAdmin(
        "Producto eliminado correctamente.",
        "exito"
    );


    await cargarDatosAdministracion();
}


/* =========================================================
   RESUMEN
========================================================= */

function actualizarResumen() {

    const totalCategorias =
        categoriasAdminCache.length;


    const totalProductos =
        productosAdminCache.length;


    const totalDestacados =
        productosAdminCache.filter(
            producto => producto.destacado
        ).length;


    const totalActivos =
        productosAdminCache.filter(
            producto => producto.activo
        ).length;


    document
        .getElementById(
            "total-categorias"
        )
        .textContent =
            totalCategorias;


    document
        .getElementById(
            "total-productos"
        )
        .textContent =
            totalProductos;


    document
        .getElementById(
            "total-destacados"
        )
        .textContent =
            totalDestacados;


    document
        .getElementById(
            "total-activos"
        )
        .textContent =
            totalActivos;
}


/* =========================================================
   MODALES
========================================================= */

function abrirModal(id) {

    const modal =
        document.getElementById(id);


    if (!modal) return;


    modal.classList.add("abierto");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";
}


function cerrarModal(id) {

    const modal =
        document.getElementById(id);


    if (!modal) return;


    modal.classList.remove("abierto");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";
}


/* =========================================================
   CERRAR SESIÓN
========================================================= */

async function cerrarSesion() {

    const confirmar =
        confirm(
            "¿Deseas cerrar la sesión administrativa?"
        );


    if (!confirmar) return;


    const supabase = obtenerSupabase();


    const { error } =
        await supabase.auth.signOut();


    if (error) {

        console.error(
            "Error cerrando sesión:",
            error
        );


        mostrarMensajeAdmin(
            "No se pudo cerrar la sesión.",
            "error"
        );

        return;
    }


    window.location.href =
        "login.html";
}


/* =========================================================
   MENSAJES
========================================================= */

function mostrarMensajeAdmin(
    mensaje,
    tipo = "exito"
) {

    const elemento =
        document.getElementById(
            "mensaje-admin"
        );


    if (!elemento) return;


    elemento.textContent =
        mensaje;


    elemento.className =
        `mensaje-admin visible ${tipo}`;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    setTimeout(() => {

        elemento.className =
            "mensaje-admin";

    }, 5000);
}


/* =========================================================
   ERRORES
========================================================= */

function traducirErrorAdmin(
    error,
    mensajePredeterminado
) {

    if (!error) {
        return mensajePredeterminado;
    }


    const mensaje =
        String(
            error.message || ""
        ).toLowerCase();


    if (
        mensaje.includes(
            "duplicate"
        ) ||
        mensaje.includes(
            "unique"
        )
    ) {

        return "Ya existe un registro con esos datos.";
    }


    if (
        mensaje.includes(
            "row-level security"
        )
    ) {

        return (
            "No tienes permisos administrativos " +
            "para realizar esta operación."
        );
    }


    return (
        error.message ||
        mensajePredeterminado
    );
}


/* =========================================================
   FORMATO DE PRECIO
========================================================= */

function formatearPrecio(precio) {

    if (
        precio === null ||
        precio === undefined ||
        precio === ""
    ) {

        return "Consultar";
    }


    return new Intl.NumberFormat(
        "es-NI",
        {
            style: "currency",
            currency: "NIO",
            minimumFractionDigits: 2
        }
    ).format(Number(precio));
}


/* =========================================================
   EXTENSIÓN IMAGEN
========================================================= */

function obtenerExtensionImagen(
    nombre
) {

    const partes =
        nombre
            .split(".")
            .filter(Boolean);


    if (!partes.length) {
        return "jpg";
    }


    return partes
        .pop()
        .toLowerCase()
        .replace(
            /[^a-z0-9]/g,
            ""
        );
}


/* =========================================================
   SEGURIDAD HTML
========================================================= */

function escaparHTML(valor) {

    return String(valor ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


function escaparAtributo(valor) {

    return escaparHTML(valor);
}