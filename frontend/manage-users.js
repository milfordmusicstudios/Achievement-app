// manage-users.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://tpcjdgucyrqrzuqvshki.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwY2pkZ3VjeXJxcnp1cXZzaGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MDE5OTksImV4cCI6MjA2ODI3Nzk5OX0.XGHcwyeTzYje6cjd3PHQrr7CyyEcaoRB4GyTYN1fDqo'
);

document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.getElementById("userTableBody");

  const { data: users, error } = await supabase.from("users").select("*");
  if (error) {
    console.error("Failed to load users:", error.message);
    alert("Unable to load users. Try again later.");
    return;
  }

  users.forEach((user, index) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = user.firstName + " " + user.lastName;
    row.appendChild(nameCell);

    const emailCell = document.createElement("td");
    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.value = user.email || "";
    emailInput.dataset.userId = user.id;
    emailCell.appendChild(emailInput);
    row.appendChild(emailCell);

    const roleCell = document.createElement("td");
    const roleInput = document.createElement("input");
    roleInput.type = "text";
    roleInput.value = Array.isArray(user.roles) ? user.roles.join(", ") : (user.roles || "");
    roleInput.dataset.userId = user.id;
    roleCell.appendChild(roleInput);
    row.appendChild(roleCell);

    const saveCell = document.createElement("td");
    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.className = "blue-button";
    saveButton.onclick = async () => {
      const updatedEmail = emailInput.value;
      const updatedRole = roleInput.value.split(",").map(r => r.trim());

      const { error } = await supabase.from("users").update({
        email: updatedEmail,
        roles: updatedRole
      }).eq("id", user.id);

      if (error) {
        console.error("Update error:", error.message);
        alert("Failed to update user.");
      } else {
        alert("User updated successfully.");
      }
    };
    saveCell.appendChild(saveButton);
    row.appendChild(saveCell);

    tableBody.appendChild(row);
  });
});