gcc \
    -o tests mmz/test.c mmz/munit/*.c \
    -g3 -fsanitize=address,undefined \
    -lm

# gcc \
#     -o mmz-bin mmz/*.c mmz/munit/*.c \
#     -I./ \
#     -O2 -Wall -Wextra -Wpedantic \
#     $(pkg-config --cflags --libs luajit) \
#     $(pkg-config --cflags --libs libpq) \
#     $(pkg-config --cflags --libs lua) \
#     -lm
