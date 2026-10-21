<?php
// Impostazioni del sito. Modifica solo i valori tra apici.
return [
    'site_name'            => 'Osteria Enoteca Dvor',
    // Dove arrivano i messaggi del modulo contatti
    'mail_to_reservations' => 'prenotazioni@osteriadvor.com',
    'mail_to_info'         => 'info@osteriadvor.com',
    // Indirizzo "mittente" delle email del sito: deve essere un indirizzo del tuo dominio
    'mail_from'            => 'noreply@osteriadvor.com',
    // Foto: dimensione massima in pixel del lato lungo
    'max_px'               => 1800,
    // Recensioni Google (facoltativo): chiave API di Google Cloud con "Places API (New)" attiva.
    // Senza chiave il blocco recensioni mostra solo quelle aggiunte a mano dall'area admin.
    'google_api_key'       => '',
    // ID del luogo su Google (facoltativo: se vuoto viene cercato in automatico con il testo qui sotto)
    'google_place_id'      => '',
    'google_query'         => 'DVOR Osteria Enoteca, Via Castello 5, San Floriano del Collio',
    // Link "Leggi tutte le recensioni" e "Scrivi una recensione"
    'google_maps_url'      => 'https://www.google.com/maps/place/DVOR+Osteria+Enoteca/@45.9806553,13.5822477,17z/data=!4m8!3m7!1s0x477baa8c29a5ae9b:0xa7e1155b86fd4b8!8m2!3d45.9806516!4d13.5848226!9m1!1b1',
    // Mostra solo recensioni con almeno queste stelle
    'reviews_min_rating'   => 4,
];
