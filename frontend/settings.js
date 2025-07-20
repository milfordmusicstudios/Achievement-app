import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { getCurrentUser, getActiveRole, logout } from './auth.js';

const supabase = createClient(
  'https://tpcjdgucyrqrzuqvshki.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwY2pkZ3VjeXJxcnp1cXZzaGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MDE5OTksImV4cCI6MjA2ODI3Nzk5OX0.XGHcwyeTzYje6cjd3PHQrr7CyyEcaoRB4GyTYN1fDqo'
);

document.addEventListener("DOMContentLoaded", async () => {
  const user = getCurrentUser();
  const role = getActiveRole();

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  // DOM elements
  const firstNameInput = document.getElementById("firstNameInput");
  const lastNameInput = document.getElementById("lastNameInput");
  const currentEmail = document.getElementById("currentEmail");
  const newEmail = document.getElementById("newEmail");
  const newPassword = document.getElementById("newPassword");
  const roleText = document.getElementById("currentRoleText");
  const switchRoleBtn = document.getElementById("switchRoleBtn");
  const avatarEl = document.getElementById("settingsAvatar");

  // Fill in user info
  firstNameInput.value = user.firstName || "";
  lastNameInput.value = user.lastName || "";
  currentEmail.value = user.email || "";
  roleText.textContent = role;

  // Show switch role if multiple roles
  if (user.roles && user.roles.length > 1) {
    switchRoleBtn.style.display = "inline-block";
    switchRoleBtn.addEventListener("click", () => {
      const currentIndex = user.roles.indexOf(role);
      const nextRole = user.roles[(currentIndex + 1) % user.roles.length];
      localStorage.setItem("activeRole", nextRole);
      location.reload();
    });
  }

  // Load avatar from Supabase
  if (avatarEl && user.avatar) {
    const { data, error } = supabase.storage.from("avatars").getPublicUrl(user.avatar);
    if (data?.publicUrl) {
      avatarEl.src = data.publicUrl;
      avatarEl.alt = `${user.firstName}'s Avatar`;
    } else {
      console.warn("⚠️ Avatar load error:", error?.message);
    }
  }

  // Save profile info
  document.getElementById("updateCredentialsBtn").addEventListener("click", async (e) => {
    e.preventDefault();

    // Just console log for now — you can later hook into Supabase auth updates
    console.log("Update requested:", {
      firstName: firstNameInput.value,
      lastName: lastNameInput.value,
      newEmail: newEmail.value,
      newPassword: newPassword.value
    });

    alert("Update functionality coming soon!");
  });
});
