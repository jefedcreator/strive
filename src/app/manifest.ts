import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Strive',
        short_name: 'Strive',
        description: 'Sync Your Fitness Journey',
        start_url: '/',
        display: 'standalone',
        background_color: '#F7F9FB',
        theme_color: '#F7F9FB',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    };
}
