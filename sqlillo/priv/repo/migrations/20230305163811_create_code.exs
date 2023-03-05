defmodule Sqlillo.Repo.Migrations.CreateCode do
  use Ecto.Migration

  def change do
    create table(:code) do
      add :code, :string
      add :user_email, :string

      timestamps()
    end
  end
end
