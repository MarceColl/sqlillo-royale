FROM archlinux:latest

RUN pacman -Syu --noconfirm
RUN pacman -S luajit postgresql --noconfirm

COPY mmz ./mmz
CMD ./mmz
