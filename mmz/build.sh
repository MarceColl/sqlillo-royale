gcc -o mmz *.c -O2 -Wall -Wextra -Wpedantic $(pkg-config --cflags --libs luajit) $(pkg-config --cflags --libs libpq) $(pkg-config --cflags --libs lua) -lm
