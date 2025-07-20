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

  // Elements
  const firstNameInput = document.getElementById("firstNameInput");
  const lastNameInput = document.getElementById("lastNameInput");
  const currentEmail = document.getElementById("currentEmail");
  const currentPassword = document.getElementById("currentPassword");
  const newPassword = document.getElementById("newPassword");
  const roleText = document.getElementById("currentRoleText");
  const switchRoleBtn = document.getElementById("switchRoleBtn");
  const avatarEl = document.getElementById("settingsAvatar");

  // Populate values
  firstNameInput.value = user.firstName || "";
  lastNameInput.value = user.lastName || "";
  currentEmail.value = user.email || "";
  roleText.textContent = role;

  // Load avatar
  if (avatarEl && user.avatar) {
    const { data, error } = supabase.storage.from("avatars").getPublicUrl(user.avatar);
    if (data?.publicUrl) {
      avatarEl.src = data.publicUrl;
      avatarEl.alt = `${user.firstName}'s Avatar`;
    }
  }

  // Switch role (if user has multiple)
  if (user.roles && user.roles.length > 1) {
    switchRoleBtn.style.display = "inline-block";
    switchRoleBtn.addEventListener("click", () => {
      const currentIndex = user.roles.indexOf(role);
      const nextRole = user.roles[(currentIndex + 1) % user.roles.length];
      localStorage.setItem("activeRole", nextRole);
      location.reload();
    });
  }

  // Save name changes
  document.getElementById("saveNameBtn").addEventListener("click", (e) => {
    e.preventDefault();
    console.log("Saving name:", firstNameInput.value, lastNameInput.value);
    alert("Name changes saved (functionality to be implemented)");
  });

  // Update credentials
  document.getElementById("updateCredentialsBtn").addEventListener("click", async (e) => {
    e.preventDefault();

    if (!currentPassword.value || !newPassword.value) {
      alert("Please enter your current and new password.");
      return;
    }

    // This is where you'd verify the current password and update via Supabase Auth
    console.log("Updating password to:", newPassword.value);
    alert("Password update functionality coming soon.");
  });
});
