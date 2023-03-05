defmodule Sqlillo.Repo.Migrations.ChangeColumnsToText do
  use Ecto.Migration

  def change do
    alter table("code") do
      modify :code, :text
      modify :user_email, :text
    end
  end
end
