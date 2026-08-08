import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: false,
  images: {
    // Allow images from R2 and local
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
    ],
    // Next's built-in optimizer proxies local (same-origin) image URLs through an internal
    // request to the Payload media route rather than fetching over the network; that internal
    // proxy fails against Payload's custom route handler (confirmed reproducible for every local
    // media file, across every tenant — Ghee Roast and Curious Ladoo alike), so every <Image> on
    // the site silently failed to load. Disabling optimization serves the original file directly
    // instead, trading automatic resize/format-conversion for images that actually render.
    unoptimized: true,
  },
}

export default withPayload(nextConfig)
