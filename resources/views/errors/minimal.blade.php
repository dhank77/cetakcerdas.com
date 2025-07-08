<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>@yield('title')</title>

        <script src="https://cdn.tailwindcss.com"></script>
        <style type="text/tailwindcss">
            @layer base {
                :root {
                    --color-primary-50: 240 5% 96%;
                    --color-primary-100: 240 5% 90%;
                    --color-primary-200: 240 5% 80%;
                    --color-primary-300: 240 5% 70%;
                    --color-primary-400: 240 5% 60%;
                    --color-primary-500: 240 5% 50%;
                    --color-primary-600: 240 5% 40%;
                    --color-primary-700: 240 5% 30%;
                    --color-primary-800: 240 5% 20%;
                    --color-primary-900: 240 5% 10%;
                    --color-primary-950: 240 5% 5%;

                    --color-text-light: 0 0% 100%;
                    --color-text-dark: 240 10% 3%;

                    --color-background-light: 0 0% 100%;
                    --color-background-dark: 240 10% 3%;

                    --color-card-light: 240 5% 96%;
                    --color-card-dark: 240 5% 10%;

                    --color-border-light: 240 5% 80%;
                    --color-border-dark: 240 5% 20%;
                }

                .dark {
                    --color-primary-50: 240 5% 5%;
                    --color-primary-100: 240 5% 10%;
                    --color-primary-200: 240 5% 20%;
                    --color-primary-300: 240 5% 30%;
                    --color-primary-400: 240 5% 40%;
                    --color-primary-500: 240 5% 50%;
                    --color-primary-600: 240 5% 60%;
                    --color-primary-700: 240 5% 70%;
                    --color-primary-800: 240 5% 80%;
                    --color-primary-900: 240 5% 90%;
                    --color-primary-950: 240 5% 96%;

                    --color-text-light: 240 10% 3%;
                    --color-text-dark: 0 0% 100%;

                    --color-background-light: 240 10% 3%;
                    --color-background-dark: 0 0% 100%;

                    --color-card-light: 240 5% 10%;
                    --color-card-dark: 240 5% 96%;

                    --color-border-light: 240 5% 20%;
                    --color-border-dark: 240 5% 80%;
                }
            }

            @layer utilities {
                .text-primary-50 { color: hsl(var(--color-primary-50)); }
                .text-primary-100 { color: hsl(var(--color-primary-100)); }
                .text-primary-200 { color: hsl(var(--color-primary-200)); }
                .text-primary-300 { color: hsl(var(--color-primary-300)); }
                .text-primary-400 { color: hsl(var(--color-primary-400)); }
                .text-primary-500 { color: hsl(var(--color-primary-500)); }
                .text-primary-600 { color: hsl(var(--color-primary-600)); }
                .text-primary-700 { color: hsl(var(--color-primary-700)); }
                .text-primary-800 { color: hsl(var(--color-primary-800)); }
                .text-primary-900 { color: hsl(var(--color-primary-900)); }
                .text-primary-950 { color: hsl(var(--color-primary-950)); }

                .bg-primary-50 { background-color: hsl(var(--color-primary-50)); }
                .bg-primary-100 { background-color: hsl(var(--color-primary-100)); }
                .bg-primary-200 { background-color: hsl(var(--color-primary-200)); }
                .bg-primary-300 { background-color: hsl(var(--color-primary-300)); }
                .bg-primary-400 { background-color: hsl(var(--color-primary-400)); }
                .bg-primary-500 { background-color: hsl(var(--color-primary-500)); }
                .bg-primary-600 { background-color: hsl(var(--color-primary-600)); }
                .bg-primary-700 { background-color: hsl(var(--color-primary-700)); }
                .bg-primary-800 { background-color: hsl(var(--color-primary-800)); }
                .bg-primary-900 { background-color: hsl(var(--color-primary-900)); }
                .bg-primary-950 { background-color: hsl(var(--color-primary-950)); }

                .text-text-light { color: hsl(var(--color-text-light)); }
                .text-text-dark { color: hsl(var(--color-text-dark)); }

                .bg-background-light { background-color: hsl(var(--color-background-light)); }
                .bg-background-dark { background-color: hsl(var(--color-background-dark)); }

                .bg-card-light { background-color: hsl(var(--color-card-light)); }
                .bg-card-dark { background-color: hsl(var(--color-card-dark)); }

                .border-border-light { border-color: hsl(var(--color-border-light)); }
                .border-border-dark { border-color: hsl(var(--color-border-dark)); }
            }

            @keyframes float { 
                0% { transform: translateY(0px); } 
                50% { transform: translateY(-10px); } 
                100% { transform: translateY(0px); } 
            }

            .animate-float {
                animation: float 3s ease-in-out infinite;
            }
        </style>
    </head>
    <body class="antialiased bg-background-light dark:bg-background-dark text-text-dark dark:text-text-light overflow-hidden">
        <div class="relative flex items-center justify-center min-h-screen">
            <!-- Background elements for visual interest -->
            <div class="absolute inset-0 z-0 opacity-10 dark:opacity-5">
                <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
                <div class="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary-700 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float animation-delay-2000"></div>
                <div class="absolute top-1/2 left-1/2 w-48 h-48 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float animation-delay-4000"></div>
            </div>

            <div class="relative z-10 max-w-xl mx-auto p-8 bg-card-light dark:bg-card-dark rounded-lg shadow-2xl text-center border border-border-light dark:border-border-dark transform transition-all duration-500 hover:scale-105">
                <div class="mb-6">
                    <svg class="mx-auto h-28 w-28 text-primary-500 animate-bounce-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        @yield('icon')
                    </svg>
                </div>
                <div class="text-7xl font-extrabold text-primary-700 dark:text-primary-300 mb-4 animate-pulse-slow">
                    @yield('code')
                </div>
                <div class="text-3xl font-semibold text-primary-600 dark:text-primary-400 mb-6">
                    @yield('message')
                </div>
                <p class="text-lg text-primary-800 dark:text-primary-200 mb-8 leading-relaxed">
                    @yield('description')
                </p>
                <a href="/" class="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-full transition duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    Kembali ke Beranda
                </a>
            </div>
        </div>
    </body>
</html>
