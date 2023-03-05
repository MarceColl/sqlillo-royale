defmodule SqlilloWeb.CodeController do
  use SqlilloWeb, :controller

  def save(conn, params) do
    IO.inspect(params)
    conn
  end
end
