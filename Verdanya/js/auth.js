/* =========================================================
   VERDANYA
   AUTENTICACIÓN
========================================================= */


/* =========================================================
   INICIO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    iniciarLogin
);


/* =========================================================
   LOGIN
========================================================= */

async function iniciarLogin() {

    actualizarAnio();

    const supabase = obtenerSupabase();

    if (!supabase) {

        mostrarMensaje(
            "No se pudo conectar con el servicio de autenticación.",
            "error"
        );

        return;
    }


    /*
     * Comprobamos si ya existe una sesión.
     *
     * Si el usuario ya está autenticado,
     * no necesita volver a iniciar sesión.
     */

    const {
        data: { session }
    } = await supabase.auth.getSession();


    if (session) {

        window.location.href = "admin.html";

        return;
    }


    configurarFormularioLogin();
}


/* =========================================================
   FORMULARIO
========================================================= */

function configurarFormularioLogin() {

    const formulario =
        document.getElementById("formulario-login");

    if (!formulario) return;


    formulario.addEventListener(
        "submit",
        manejarLogin
    );
}


/* =========================================================
   PROCESAR LOGIN
========================================================= */

async function manejarLogin(evento) {

    evento.preventDefault();


    const correo =
        document.getElementById("correo").value.trim();

    const contrasena =
        document.getElementById("contrasena").value;


    const boton =
        document.getElementById("boton-login");


    if (!correo || !contrasena) {

        mostrarMensaje(
            "Completa el correo electrónico y la contraseña.",
            "error"
        );

        return;
    }


    const supabase = obtenerSupabase();

    if (!supabase) {

        mostrarMensaje(
            "No se pudo conectar con Supabase.",
            "error"
        );

        return;
    }


    boton.disabled = true;

    boton.textContent = "Ingresando...";

    ocultarMensaje();


    try {

        const {
            data,
            error
        } = await supabase.auth.signInWithPassword({

            email: correo,

            password: contrasena

        });


        if (error) {

            console.error(
                "Error de autenticación:",
                error
            );

            mostrarMensaje(
                traducirErrorLogin(error),
                "error"
            );

            boton.disabled = false;

            boton.textContent = "Ingresar";

            return;
        }


        if (!data.session) {

            mostrarMensaje(
                "No se pudo crear la sesión.",
                "error"
            );

            boton.disabled = false;

            boton.textContent = "Ingresar";

            return;
        }


        mostrarMensaje(
            "Acceso correcto. Abriendo administración...",
            "exito"
        );


        /*
         * Pequeña pausa para que el usuario
         * pueda ver el mensaje de éxito.
         */

        setTimeout(() => {

            window.location.href = "admin.html";

        }, 600);


    } catch (error) {

        console.error(
            "Error inesperado:",
            error
        );

        mostrarMensaje(
            "Ocurrió un error inesperado. Intenta nuevamente.",
            "error"
        );

        boton.disabled = false;

        boton.textContent = "Ingresar";
    }
}


/* =========================================================
   MENSAJES
========================================================= */

function mostrarMensaje(
    mensaje,
    tipo = "error"
) {

    const elemento =
        document.getElementById("mensaje-login");

    if (!elemento) return;


    elemento.textContent = mensaje;

    elemento.className =
        `mensaje-login visible ${tipo}`;
}


function ocultarMensaje() {

    const elemento =
        document.getElementById("mensaje-login");

    if (!elemento) return;


    elemento.textContent = "";

    elemento.className = "mensaje-login";
}


/* =========================================================
   TRADUCIR ERRORES
========================================================= */

function traducirErrorLogin(error) {

    if (!error) {

        return "No se pudo iniciar sesión.";
    }


    const mensaje =
        String(error.message || "").toLowerCase();


    if (
        mensaje.includes("invalid login credentials")
    ) {

        return "El correo o la contraseña son incorrectos.";
    }


    if (
        mensaje.includes("email not confirmed")
    ) {

        return "El correo electrónico todavía no ha sido confirmado.";
    }


    if (
        mensaje.includes("too many requests")
    ) {

        return "Se realizaron demasiados intentos. Espera unos minutos e inténtalo nuevamente.";
    }


    return (
        error.message ||
        "No se pudo iniciar sesión."
    );
}


/* =========================================================
   AÑO
========================================================= */

function actualizarAnio() {

    const elemento =
        document.getElementById("anio-actual");

    if (!elemento) return;


    elemento.textContent =
        new Date().getFullYear();
}