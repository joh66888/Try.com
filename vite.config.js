export default {
    root: 'src/', // Sources files (typically where index.html is)
    publicDir: '../static/', // Path from "root" to static assets (files that are served as they are)
    server: {
        host: true, // Open to local network and display URL
        open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env) // Open if it's not a CodeSandbox
    },
    build: {
        outDir: '../dist', // Output in the dist/ folder
        emptyOutDir: true, // Empty the folder first
        sourcemap: true, // Add sourcemap
        minify: 'esbuild',
        target: 'esnext',
        assetsDir: 'assets',
        rollupOptions: {
            output: {
                manualChunks: {
                    three: ['three']
                },
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name.endsWith('.hdr')) {
                        return 'textures/environmentMap/[name][extname]';
                    }
                    return 'assets/[name]-[hash][extname]';
                }
            }
        },
        assetsInlineLimit: 0 // Never inline assets
    },
    optimizeDeps: {
        exclude: ['@esbuild/linux-x64']
    },
    assetsInclude: ['**/*.hdr'],
    // Configure asset handling
    resolve: {
        alias: {
            '/textures': '/static/textures'
        }
    }
}