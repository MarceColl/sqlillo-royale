defmodule Sqlillo.Game do
  use Ecto.Schema
  import Ecto.Changeset

  schema "games" do
    field :traces, :binary

    timestamps()
  end

  @doc false
  def changeset(game, attrs) do
    game
    |> cast(attrs, [:traces])
    |> validate_required([:traces])
  end
end
