defmodule Sqlillo.Code do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, only: [from: 2]

  schema "code" do
    field :code, :string
    field :user_email, :string

    timestamps()
  end

  @doc false
  def changeset(code, attrs) do
    code
    |> cast(attrs, [:code, :user_email])
    |> validate_required([:code, :user_email])
  end

  def create_revision(user, code) do
    changeset(%Sqlillo.Code{}, %{user_email: user, code: code})
    |> Sqlillo.Repo.insert
  end

  def get_latest_code(user) do
    query = from u in Sqlillo.Code,
              where: u.user_email == ^user,
              limit: 1,
              order_by: [desc: :id]

    IO.inspect(Sqlillo.Repo.one(query))
  end
end
