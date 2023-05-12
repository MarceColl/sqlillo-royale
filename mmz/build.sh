gcc -o mmz-bin *.c \
    -O2 -Wall -Wextra -Wpedantic \
    -fsanitize=address -g \
    $(pkg-config --cflags --libs luajit) \
    $(pkg-config --cflags --libs libpq) \
    $(pkg-config --cflags --libs lua) \
    -lm
    # $(pkg-config --cflags --libs sdl2) \
