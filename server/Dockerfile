FROM python:3.11-slim

RUN apt update && apt upgrade -y
RUN apt install curl libpq5 -y
RUN curl -sSL https://install.python-poetry.org | python3 -
RUN /root/.local/bin/poetry config virtualenvs.create false

COPY ./ ./
RUN /root/.local/bin/poetry install --no-cache --no-interaction

ENTRYPOINT ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
