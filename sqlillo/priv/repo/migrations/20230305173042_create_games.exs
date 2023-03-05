defmodule Sqlillo.Repo.Migrations.CreateGames do
  use Ecto.Migration

  def change do
    create table(:games) do
      add :traces, :binary

      timestamps()
    end
  end
end
