DEBUG ?= 1
TEST ?= 0
CFLAGS := -g $(shell pkg-config --cflags luajit) -I./src
LDFLAGS := -lpthread $(shell pkg-config --libs luajit) -lm

DBGDIR := ./out/dbg
RELDIR := ./out/rel
TESTDIR := ./out/test

ifeq (DEBUG, 1)
	CFLAGS += -g -g3 -gdwarf-2
	OUTDIR := $(DBGDIR)
else
	CFLAGS += -O2 -march=native -flto
	OUTDIR := $(RELDIR)
endif

ifeq (TEST, 1)
	CFLAGS += -DCIUT_ENABLED=1
	OUTDIR := $(TESTDIR)
endif

.PHONY: all release debug create_outdir

all: create_outdir mmz

create_outdir:
	mkdir -p $(OUTDIR)

release:  	## Build the release version
	@make -f $(MAKEFILE_LIST) DEBUG=0

dbg: 		## Build the debug version
	@make -f $(MAKEFILE_LIST) DEBUG=1

mmz: $(OUTDIR)/main.o $(OUTDIR)/yyjson.o
	cc $^ ${CFLAGS} ${LDFLAGS} -o $@

$(OUTDIR)%.o: src/%.c
	cc -c $< ${CFLAGS} -o $@ -DCIUT_ENABLED=1

test: $(OUTDIR)/ciutmain.o ## Run the test suite
	cc $^ ${CFLAGS} ${LDFLAGS} -DCIUT_ENABLED=1 -o $@

clean: 		## Clean all build artifacts
	rm mmz
	rm -rf ./out

help:           ## Show this help.
	@grep -F -h "##" $(MAKEFILE_LIST) | grep -F -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

