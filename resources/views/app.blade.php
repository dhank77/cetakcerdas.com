<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="captcha-sitekey" content="{{ config('captcha.sitekey') }}">
        <meta name="description" content="CetakCerdas.com membantu Anda menghitung harga cetak dokumen, print, dan jilid secara online. Mudah, cepat, dan akurat.">
        <meta name="keywords" content="cetak cerdas,cetak online, harga print, harga jilid, cetak dokumen, print pdf, hitung biaya cetak">
        <link rel="canonical" href="https://cetakcerdas.com/" />
        <meta name="author" content="dhank77 | PT. Hitech Aksara Digital">

        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <title inertia>{{ config('app.name', 'CetakCeras.Com') }}</title>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
        
        {{-- reCAPTCHA v2 Script --}}
        {!! NoCaptcha::renderJs() !!}
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
