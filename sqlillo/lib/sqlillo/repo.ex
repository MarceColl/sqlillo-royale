defmodule Sqlillo.Repo do
  use Ecto.Repo,
    otp_app: :sqlillo,
    adapter: Ecto.Adapters.Postgres
end
