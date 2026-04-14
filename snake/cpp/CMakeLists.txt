cmake_minimum_required(VERSION 3.14)
project(SnakeEvolution LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find raylib installed via Homebrew
find_package(raylib REQUIRED)

add_executable(snake_evolution
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

target_link_libraries(snake_evolution PRIVATE raylib)
target_include_directories(snake_evolution PRIVATE src)
