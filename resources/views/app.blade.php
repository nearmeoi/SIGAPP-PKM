<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title inertia>{{ config('app.name', 'BikinMap') }}</title>
    @viteReactRefresh
    @vite('resources/js/app.tsx')
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>