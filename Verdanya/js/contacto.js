 /* =========================================================
   VERDANYA
   CONTACTO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    iniciarContacto
);


/* =========================================================
   INICIO
========================================================= */

function iniciarContacto() {

    configurarWhatsApp();

    actualizarAnio();

}


/* =========================================================
   WHATSAPP
========================================================= */

function configurarWhatsApp() {

    if (
        typeof VERDANYA_CONFIG === "undefined"
    ) {

        console.error(
            "No fue posible cargar la configuración de Verdanya."
        );

        return;
    }


    if (
        typeof crearEnlaceWhatsApp !== "function"
    ) {

        console.error(
            "No existe la función crearEnlaceWhatsApp."
        );

        return;
    }


    const mensaje =
        VERDANYA_CONFIG.whatsapp.mensajeGeneral;


    const enlace =
        crearEnlaceWhatsApp(
            mensaje
        );


    /* BOTÓN PRINCIPAL DE CONTACTO */

    const boton =
        document.getElementById(
            "boton-whatsapp-contacto"
        );

    if (boton) {

        boton.href =
            enlace;

    }


    /* WHATSAPP FLOTANTE */

    const flotante =
        document.getElementById(
            "whatsapp-flotante-contacto"
        );

    if (flotante) {

        flotante.href =
            enlace;

    }

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