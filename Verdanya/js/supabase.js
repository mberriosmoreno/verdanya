/* =========================================================
   VERDANYA
   CONEXIÓN CON SUPABASE
========================================================= */


/*
    Este archivo será el punto central
    de comunicación con Supabase.

    La URL y la Anon Key se configurarán
    posteriormente desde:

        js/config.js
*/


let verdanyaSupabase = null;


/* =========================================================
   INICIALIZAR SUPABASE
========================================================= */

function inicializarSupabase() {

    if (
        !VERDANYA_CONFIG.supabase.url ||
        !VERDANYA_CONFIG.supabase.anonKey
    ) {

        console.warn(
            "Supabase todavía no está configurado."
        );

        return null;
    }


    if (
        typeof window.supabase === "undefined"
    ) {

        console.error(
            "La biblioteca de Supabase no está disponible."
        );

        return null;
    }


    verdanyaSupabase =
        window.supabase.createClient(

            VERDANYA_CONFIG.supabase.url,

            VERDANYA_CONFIG.supabase.anonKey
        );


    return verdanyaSupabase;
}


/* =========================================================
   OBTENER CLIENTE SUPABASE
========================================================= */

function obtenerSupabase() {

    if (!verdanyaSupabase) {

        inicializarSupabase();
    }

    return verdanyaSupabase;
}
