<?php

return [
    'google' => [
        'client_id'     => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect'      => env('GOOGLE_REDIRECT_URI'),
    ],

    'odoo' => [
        'url'      => env('ODOO_URL', 'https://crm.bunaroots.com'),
        'db'       => env('ODOO_DB'),
        'username' => env('ODOO_USERNAME'),
        'password' => env('ODOO_PASSWORD'),
    ],
];
