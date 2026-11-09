<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Terrain — Coffee Traceability</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body>
    <div id="app"
         data-page="{{ $page ?? 'login' }}"
         data-supplier="{{ isset($supplier) ? json_encode(['id' => $supplier->id, 'name' => $supplier->name, 'email' => $supplier->email, 'avatar' => $supplier->avatar, 'role' => $supplier->role, 'odoo_id' => $supplier->odoo_id]) : 'null' }}"
         data-farms="{{ isset($farms) ? json_encode($farms) : '[]' }}"
         data-error="{{ $error ?? '' }}">
    </div>
</body>
</html>
