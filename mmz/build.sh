gcc \
    -o mmz-bin mmz/*.c mmz/**/*.c \
    -I./ \
    -O2 -Wall -Wextra -Wpedantic \
    $(pkg-config --cflags --libs luajit) \
    $(pkg-config --cflags --libs libpq) \
    $(pkg-config --cflags --libs lua) \
    -lm
