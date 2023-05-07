gcc -o mmz *.c -g -Wall -Wextra -Wpedantic $(pkg-config --cflags --libs luajit) $(pkg-config --cflags --libs libpq) $(pkg-config --cflags --libs lua) -lm
