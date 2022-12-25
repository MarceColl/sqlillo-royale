CFLAGS := -O2 -march=native -flto -g $(shell pkg-config --cflags luajit) $(shell pkg-config --cflags sdl2) -I./yyjson
LDFLAGS := -lpthread $(shell pkg-config --libs luajit) $(shell pkg-config --libs sdl2) -lm

.PHONY: all

all: mmz

mmz: main.o yyjson.o
	cc main.o yyjson.o ${CFLAGS} ${LDFLAGS} -o mmz

main.o: main.c
	cc -c main.c ${CFLAGS} -o main.o

yyjson.o: yyjson/yyjson.c
	cc -c yyjson/yyjson.c ${CFLAGS} -o yyjson.o

clean:
	remove mmz
