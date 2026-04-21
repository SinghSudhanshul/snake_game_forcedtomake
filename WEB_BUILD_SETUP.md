# WebAssembly Build Setup Guide

This guide explains how to set up and build the Snake Evolution game for the web using Emscripten.

## What is Emscripten?

Emscripten is a complete compiler toolchain to WebAssembly, using LLVM, that compiles C and C++ into WebAssembly that runs at near-native speeds in all web browsers.

## Installation

### macOS

```bash
# Install using Homebrew
brew install emscripten

# Verify installation
emcc --version
emcmake --version
```

### Linux (Ubuntu/Debian)

```bash
# Install build dependencies
sudo apt-get install git nodejs default-jre

# Install Emscripten SDK
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest

# Add to PATH (temporary)
source ./emsdk_env.sh

# Or add to ~/.bashrc for permanent use:
echo 'source /path/to/emsdk/emsdk_env.sh' >> ~/.bashrc
source ~/.bashrc
```

### Windows (WSL2 recommended)

```bash
# WSL2 setup (inside Ubuntu bash)
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

### Verify Installation

After installation, verify everything is working:

```bash
emcc --version      # Should show Emscripten version
emsdk --version     # Should show emsdk version
emcmake --help      # Should show help text
```

## Building for Web

Once Emscripten is installed, building is simple:

### Quick Build

```bash
cd /path/to/snake_game_c++
./build.sh web
```

### Manual Build

```bash
cd /path/to/snake_game_c++
emcmake cmake -B build-web -DWEB_BUILD=ON
cmake --build build-web --config Release
```

## Serving the Web Version

After a successful web build, serve the files:

```bash
cd build-web/web
python -m http.server 8000
# Open browser to: http://localhost:8000
```

Or using Node.js:

```bash
cd build-web/web
npx http-server
# Open browser to: http://localhost:8080
```

## Build Output Files

After `./build.sh web`, you'll find:

```
build-web/web/
├── index.html              # HTML shell (from web/shell.html)
├── snake_game.js          # JavaScript loader & glue code
├── snake_game.wasm        # WebAssembly binary (actual game)
└── snake_game.data        # Optional data files (if any)
```

**All three files are needed to run the game.**

## Performance

- **Initial Load**: ~2-3 seconds (downloads & compiles WASM)
- **Runtime Performance**: 55-60 FPS on modern browsers
- **Memory Usage**: ~50MB baseline
- **WASM Size**: ~500-800KB (depending on optimization)

## Browser Compatibility

| Browser | Support | Min Version | Notes |
|---------|---------|-------------|-------|
| Chrome | ✅ | 57+ | Best performance |
| Firefox | ✅ | 79+ | Excellent support |
| Safari | ✅ | 14+ | Full support |
| Edge | ✅ | 79+ | Chromium-based |
| Opera | ✅ | 44+ | Works well |
| Mobile Chrome | ✅ | Latest | Good performance |
| Mobile Safari | ✅ | 14+ | Supported |

## Troubleshooting

### Build fails with "raylib not found"

Emscripten has raylib built-in, but CMake might not find it. Try:

```bash
emcmake cmake -B build-web -DWEB_BUILD=ON \
    -DCMAKE_PREFIX_PATH=$EMSDK/upstream/emscripten/cache/ports/raylib
```

### WASM doesn't load in browser

1. Check browser console (F12 → Console) for errors
2. Verify all three files exist: `index.html`, `snake_game.js`, `snake_game.wasm`
3. Ensure you're serving over HTTP (not `file://` protocol)
4. Clear browser cache: Ctrl+Shift+Delete (or Cmd+Shift+Delete on macOS)

### Game runs slowly

1. Check browser DevTools Performance tab
2. Ensure you're using Chrome, Firefox, or Safari (best WASM support)
3. Close other browser tabs to free memory
4. Try building with optimizations:
   ```bash
   cmake --build build-web --config Release
   ```

### Audio not playing

1. Browser may require user interaction before playing audio
2. Click the game window first, then it should work
3. Check browser permissions (Settings → Sound)
4. Some browsers mute audio by default; check volume controls

## Advanced Configuration

### Custom Build Options

Edit `CMakeLists.txt` to modify:

```cmake
# In web build section:
target_link_options(snake_evolution PRIVATE
    "SHELL:-s WASM=1"                    # Enable WASM
    "SHELL:-s ALLOW_MEMORY_GROWTH=1"    # Heap can grow
    "SHELL:-s TOTAL_MEMORY=134217728"   # Initial heap size
    "SHELL:-s ASYNCIFY"                 # For async operations
)
```

### Optimization Levels

```bash
# Debug (faster build, slower runtime)
cmake --build build-web --config Debug

# Release (slower build, faster runtime) — RECOMMENDED
cmake --build build-web --config Release

# With LTO (Link-Time Optimization)
cmake -B build-web -DWEB_BUILD=ON -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_INTERPROCEDURAL_OPTIMIZATION=ON
cmake --build build-web
```

### Deploying to Production

1. Build with Release configuration:
   ```bash
   cmake --build build-web --config Release
   ```

2. Compress WASM:
   ```bash
   gzip -9 build-web/web/snake_game.wasm -o build-web/web/snake_game.wasm.gz
   ```

3. Upload to web server:
   ```bash
   scp -r build-web/web/* user@server.com:/var/www/html/games/snake/
   ```

4. Configure server with correct MIME types:
   ```
   .wasm → application/wasm
   .js   → application/javascript
   .html → text/html
   ```

## Debugging WASM

Enable debug symbols in build:

```bash
cmake -B build-web -DWEB_BUILD=ON -DCMAKE_BUILD_TYPE=Debug
cmake --build build-web
```

Then in browser DevTools:
1. Sources tab → Find WASM module
2. Set breakpoints in original C++ code (if source maps work)
3. Use Chrome DevTools for frame rate profiling

## Further Reading

- [Emscripten Documentation](https://emscripten.org/docs/)
- [raylib Emscripten Guide](https://github.com/raysan5/raylib/wiki/Working-with-Emscripten)
- [WebAssembly Docs](https://webassembly.org/)

---

**Need help?** Check the main [README.md](../README.md) for general project information.
