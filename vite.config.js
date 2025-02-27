import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    resolve: name => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true })
        return pages[`./Pages/${name}.jsx`]
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
    ],
    optimizeDeps: {
        include: ['@inertiajs/inertia', '@inertiajs/react'],
    },
    build: {
        outDir: 'public_html/build', // Menetapkan output build ke folder public/build
        manifest: true, // Penting untuk Laravel Inertia
    },
});
