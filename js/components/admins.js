export function renderAdmins(container, admins, handlers) {
  container.innerHTML = "";

  const emails = Object.values(admins || {}).sort();

  const list = document.createElement("ul");
  list.className = "admin-list";

  for (const email of emails) {
    const item = document.createElement("li");
    item.className = "admin-row";

    const label = document.createElement("span");
    label.textContent = email;
    item.appendChild(label);

    if (email === handlers.currentEmail) {
      const you = document.createElement("span");
      you.className = "tag is-light ml-2";
      you.textContent = "You";
      item.appendChild(you);
    } else {
      const remove = document.createElement("button");
      remove.className = "button is-danger is-small is-light";
      remove.textContent = "Remove";
      remove.addEventListener("click", () => handlers.onRemove(email));
      item.appendChild(remove);
    }

    list.appendChild(item);
  }

  container.appendChild(list);

  const form = document.createElement("div");
  form.className = "field has-addons mt-4";

  const control = document.createElement("div");
  control.className = "control is-expanded";
  const input = document.createElement("input");
  input.className = "input";
  input.type = "email";
  input.placeholder = "name@ucc.on.ca";
  control.appendChild(input);

  const buttonControl = document.createElement("div");
  buttonControl.className = "control";
  const addButton = document.createElement("button");
  addButton.className = "button is-link";
  addButton.textContent = "Add admin";
  buttonControl.appendChild(addButton);

  const submit = () => {
    if (handlers.onAdd(input.value)) input.value = "";
  };
  addButton.addEventListener("click", submit);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") submit();
  });

  form.append(control, buttonControl);
  container.appendChild(form);
}
