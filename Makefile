CFLAGS := -O2 -march=native -flto -g
LDFLAGS := -lpthread $(shell pkg-config --cflags --libs luajit) $(shell pkg-config --cflags --libs sdl2) -lm

.PHONY: all

all: mmz

mmz: main.c
	cc main.c ${CFLAGS} ${LDFLAGS} -o mmz

clean:
	remove mmz
