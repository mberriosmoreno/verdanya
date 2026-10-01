/* =========================================================
   VERDANYA
   CONFIGURACIÓN GENERAL
========================================================= */

const VERDANYA_CONFIG = {

    /* =====================================================
       WHATSAPP
    ===================================================== */

    whatsapp: {
        numero: "50587129724",

        mensajeGeneral:
            "Hola, Verdanya. Me gustaría consultar sobre las plantas disponibles."
    },


    /* =====================================================
       INFORMACIÓN DEL SITIO
    ===================================================== */

    sitio: {
        nombre: "Verdanya",

        descripcion:
            "Plantas que dan vida a tus espacios."
    },


    /* =====================================================
       SUPABASE
    ===================================================== */

    supabase: {

        url:
            "https://cdehkoubnmgfonbceijl.supabase.co",

        anonKey:
            "sb_publishable_yyYecT6RMgPdy2JZsAgs7Q_zQmcguEI"
    }

};


/* =========================================================
   WHATSAPP
   CREA UN ENLACE CON MENSAJE PERSONALIZADO
========================================================= */

function crearEnlaceWhatsApp(mensaje) {

    const numero = VERDANYA_CONFIG.whatsapp.numero;

    const texto = encodeURIComponent(mensaje);

    return `https://wa.me/${numero}?text=${texto}`;
}