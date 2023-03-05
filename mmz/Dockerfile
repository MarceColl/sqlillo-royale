FROM alpine:latest AS builder

RUN apk add --update alpine-sdk lua5.1-dev luajit-dev libpq-dev
COPY ./main.c ./build.sh ./yyjson.c ./yyjson.h ./
RUN sh build.sh

FROM alpine:latest

RUN apk add --no-cache lua5.1 luajit libpq
COPY --from=builder ./mmz ./mmz
ENTRYPOINT ["./mmz"]
