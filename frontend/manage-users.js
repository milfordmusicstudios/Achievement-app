import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://tpcjdgucyrqrzuqvshki.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
);

document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.getElementById("userTableBody");

  function showMessage(msg) {
    const div = document.createElement("div");
    div.textContent = msg;
    div.style.position = "fixed";
    div.style.bottom = "40px";
    div.style.left = "50%";
    div.style.transform = "translateX(-50%)";
    div.style.background = "#00477d";
    div.style.color = "white";
    div.style.padding = "12px 20px";
    div.style.borderRadius = "10px";
    div.style.fontSize = "16px";
    div.style.zIndex = "9999";
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
  }

  const { data: users, error } = await supabase.from("users").select("*");
  if (error) {
    console.error("Failed to load users:", error.message);
    showMessage("Unable to load users.");
    return;
  }

  users.forEach(user => {
    const row = document.createElement("tr");

    const firstName = document.createElement("input");
    firstName.value = user.firstName || "";

    const lastName = document.createElement("input");
    lastName.value = user.lastName || "";

    const email = document.createElement("input");
    email.type = "email";
    email.value = user.email || "";

    const avatar = document.createElement("input");
    avatar.type = "text";
    avatar.value = user.avatar || "";

    const roles = document.createElement("input");
    roles.value = Array.isArray(user.roles) ? user.roles.join(", ") : (user.roles || "");

    const teacher = document.createElement("input");
    teacher.value = user.teacher || "";

    const instrument = document.createElement("input");
    instrument.value = user.instrument || "";

    const cells = [
      firstName, lastName,
      document.createTextNode(user.id), // ID not editable
      email, avatar, roles, teacher, instrument
    ];

    cells.forEach(el => {
      const td = document.createElement("td");
      td.appendChild(el.nodeType ? el : el);
      row.appendChild(td);
    });

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.className = "blue-button";

    saveBtn.onclick = async () => {
      const { error } = await supabase.from("users").update({
        firstName: firstName.value.trim(),
        lastName: lastName.value.trim(),
        email: email.value.trim(),
        avatar: avatar.value.trim(),
        roles: roles.value.split(",").map(r => r.trim().toLowerCase()),
        teacher: teacher.value.trim(),
        instrument: instrument.value.trim()
      }).eq("id", user.id);

      if (error) {
        console.error("Update error:", error.message);
        showMessage("Failed to update user.");
      } else {
        showMessage("User updated!");
      }
    };

    const saveCell = document.createElement("td");
    saveCell.appendChild(saveBtn);
    row.appendChild(saveCell);

    tableBody.appendChild(row);
  });
});
