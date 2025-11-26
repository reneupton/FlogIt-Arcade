/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: true
    },
    images: {
        domains: [
            'cdn.pixabay.com',
            'people.com',
            'res.cloudinary.com',
            'images.unsplash.com',
            'api.dicebear.com'
        ]
    }
}

module.exports = nextConfig
