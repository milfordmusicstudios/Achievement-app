import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://tpcjdgucyrqrzuqvshki.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwY2pkZ3VjeXJxcnp1cXZzaGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MDE5OTksImV4cCI6MjA2ODI3Nzk5OX0.XGHcwyeTzYje6cjd3PHQrr7CyyEcaoRB4GyTYN1fDqo'
);

document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.getElementById("userTableBody");
  const homeBtn = document.getElementById("goHome");
  if (homeBtn) homeBtn.onclick = () => window.location.href = "home.html";

  const { data: users, error } = await supabase.from("users").select("*");
  if (error) {
    console.error("Failed to load users:", error.message);
    alert("Unable to load users. Try again later.");
    return;
  }

  users.forEach(user => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = `${user.firstName} ${user.lastName}`;
    row.appendChild(nameCell);

    const emailCell = document.createElement("td");
    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.value = user.email || "";
    emailCell.appendChild(emailInput);
    row.appendChild(emailCell);

    const rolesCell = document.createElement("td");
    const rolesInput = document.createElement("input");
    rolesInput.type = "text";
    rolesInput.value = Array.isArray(user.roles) ? user.roles.join(", ") : (user.roles || "");
    rolesCell.appendChild(rolesInput);
    row.appendChild(rolesCell);

    const saveCell = document.createElement("td");
    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.className = "blue-button";
    saveBtn.onclick = async () => {
      const updatedRoles = rolesInput.value.split(",").map(r => r.trim().toLowerCase());
      const updatedEmail = emailInput.value;

      const { error } = await supabase.from("users").update({
        email: updatedEmail,
        roles: updatedRoles
      }).eq("id", user.id);

      if (error) {
        console.error("Update error:", error.message);
        alert("Failed to update user.");
      } else {
        alert("User updated successfully.");
      }
    };

    saveCell.appendChild(saveBtn);
    row.appendChild(saveCell);

    tableBody.appendChild(row);
  });
});