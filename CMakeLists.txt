cmake_minimum_required(VERSION 3.14)
project(SnakeEvolution LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Option for web build (Emscripten)
option(WEB_BUILD "Build for WebAssembly" OFF)

# Source files (all platforms)
set(SNAKE_SOURCES
    src/main.cpp
    src/Game.cpp
    src/Snake.cpp
    src/Arena.cpp
    src/Story.cpp
    src/Renderer2D.cpp
    src/Renderer3D.cpp
    src/Renderer4D.cpp
    src/Audio.cpp
    src/UI.cpp
)

# ==================================================
# Desktop Build (Native executable with raylib)
# ==================================================
if(NOT WEB_BUILD)
    find_package(raylib REQUIRED)
    
    add_executable(snake_evolution ${SNAKE_SOURCES})
    target_include_directories(snake_evolution PRIVATE src)
    target_link_libraries(snake_evolution PRIVATE raylib)
    
    set_target_properties(snake_evolution PROPERTIES
        RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin"
    )
    
    message(STATUS "Desktop build configured. Run: ./bin/snake_evolution")
    
# ==================================================
# Web Build (WebAssembly via Emscripten)
# ==================================================
else()
    # Emscripten setup
    if(NOT EMSCRIPTEN)
        message(FATAL_ERROR "Web build requires Emscripten. Set CC=emcc CXX=em++ or use emcmake.")
    endif()
    
    # Find raylib (should be available via Emscripten)
    find_package(raylib REQUIRED)
    
    add_executable(snake_evolution ${SNAKE_SOURCES})
    target_include_directories(snake_evolution PRIVATE src)
    target_link_libraries(snake_evolution PRIVATE raylib)
    
    # Emscripten-specific settings
    set_target_properties(snake_evolution PROPERTIES
        OUTPUT_NAME "snake_game.js"
        SUFFIX ""
    )
    
    # Emscripten link flags
    target_link_options(snake_evolution PRIVATE
        "SHELL:-s WASM=1"
        "SHELL:-s ALLOW_MEMORY_GROWTH=1"
        "SHELL:-s TOTAL_MEMORY=134217728"
        "SHELL:-s ASYNCIFY"
        "SHELL:--preload-file web/data@/data"
        "SHELL:--shell-file web/shell.html"
    )
    
    set_target_properties(snake_evolution PROPERTIES
        RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/web"
    )
    
    message(STATUS "Web (WebAssembly) build configured.")
    message(STATUS "Build: emcmake cmake -B build-web -DWEB_BUILD=ON && cmake --build build-web")
    message(STATUS "Output: build-web/web/snake_game.js and snake_game.wasm")
endif()
