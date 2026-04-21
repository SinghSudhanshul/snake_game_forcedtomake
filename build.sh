#!/bin/bash
# Build script for Snake Evolution C++ project
# Supports both desktop (native) and web (WebAssembly) builds

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="${PROJECT_DIR}/build-desktop"
WEB_BUILD_DIR="${PROJECT_DIR}/build-web"

print_usage() {
    echo "Usage: ./build.sh [desktop|web|clean]"
    echo ""
    echo "Commands:"
    echo "  desktop    - Build native desktop executable"
    echo "  web        - Build WebAssembly version (requires Emscripten)"
    echo "  clean      - Remove all build artifacts"
    echo ""
}

build_desktop() {
    echo "🎮 Building desktop executable..."
    mkdir -p "$BUILD_DIR"
    cd "$BUILD_DIR"
    cmake .. -DWEB_BUILD=OFF
    cmake --build . --config Release
    echo "✅ Desktop build complete!"
    echo "   Run: $BUILD_DIR/bin/snake_evolution"
}

build_web() {
    echo "🌐 Building WebAssembly (Emscripten)..."
    
    if ! command -v emcmake &> /dev/null; then
        echo "❌ Emscripten not found! Install it first:"
        echo "   https://emscripten.org/docs/getting_started/downloads.html"
        exit 1
    fi
    
    mkdir -p "$WEB_BUILD_DIR"
    cd "$WEB_BUILD_DIR"
    emcmake cmake .. -DWEB_BUILD=ON
    cmake --build . --config Release
    echo "✅ Web build complete!"
    echo "   Serve: python -m http.server 8000 -d $WEB_BUILD_DIR/web"
    echo "   Then open: http://localhost:8000"
}

clean() {
    echo "🧹 Cleaning build artifacts..."
    rm -rf "$BUILD_DIR" "$WEB_BUILD_DIR"
    rm -rf cpp/build
    echo "✅ Cleaned!"
}

case "${1:-desktop}" in
    desktop)
        build_desktop
        ;;
    web)
        build_web
        ;;
    clean)
        clean
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo ""
        print_usage
        exit 1
        ;;
esac
