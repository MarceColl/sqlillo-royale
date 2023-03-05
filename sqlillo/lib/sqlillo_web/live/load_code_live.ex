defmodule SqlilloWeb.LoadCodeLive do
  use SqlilloWeb, :live_view

  def render(assigns) do
    ~H"""
    <div class="mx-auto max-w-xl">
      <.header class="text-center" >
      Load Code
      </.header>

      <.simple_form
        for={@form}
        id="code_form"
        phx-update="ignore"
        phx-submit="save">
        <.input field={@form[:code]} type="textarea" label="code" required />

        <:actions>
          <.button phx-disable-with="Saving code..." class="w-full">
            Save <span aria-hidden="true">→</span>
          </.button>
        </:actions>
      </.simple_form>
    </div>
    """
  end

  def mount(_params, _session, socket) do
    user = socket.assigns.current_user.email
    form = case Sqlillo.Code.get_latest_code(user) do
      %Sqlillo.Code{code: code} ->
        to_form(%{"code" => code}, as: "code")
      nil ->
        to_form(%{"code" => ""}, as: "code")
    end

    {:ok, assign(socket, form: form), temporary_assigns: [form: form]}
  end

  def handle_event("save", %{"code" => %{"code" => code}}, socket) do
    case Sqlillo.Code.create_revision(socket.assigns.current_user.email, code) do
      {:ok, code} ->
        {:noreply,
         socket
         |> put_flash(:info, "Code saved")}

      {:error, %Ecto.Changeset{} = changeset} ->
        {:noreply, assign(socket, form: to_form(changeset))}
    end
  end
end
