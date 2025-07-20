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

  const firstNameInput = document.getElementById("firstNameInput");
  const lastNameInput = document.getElementById("lastNameInput");
  const currentEmail = document.getElementById("currentEmail");
  const currentPassword = document.getElementById("currentPassword");
  const newPassword = document.getElementById("newPassword");
  const roleText = document.getElementById("currentRoleText");
  const switchRoleBtn = document.getElementById("switchRoleBtn");
  const avatarEl = document.getElementById("settingsAvatar");
  const avatarUpload = document.getElementById("avatarUpload");

  // Populate values
  firstNameInput.value = user.firstName || "";
  lastNameInput.value = user.lastName || "";
  currentEmail.value = user.email || "";
  roleText.textContent = role;

  // Load avatar
  if (avatarEl && user.avatar) {
    const { data } = supabase.storage.from("avatars").getPublicUrl(user.avatar);
    if (data?.publicUrl) {
      avatarEl.src = data.publicUrl;
    }
  }

  // Switch role
  if (user.roles && user.roles.length > 1) {
    switchRoleBtn.style.display = "inline-block";
    switchRoleBtn.addEventListener("click", () => {
      const currentIndex = user.roles.indexOf(role);
      const nextRole = user.roles[(currentIndex + 1) % user.roles.length];
      localStorage.setItem("activeRole", nextRole);
      location.reload();
    });
  }

  // Save name
  document.getElementById("saveNameBtn").addEventListener("click", async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from("users")
      .update({
        firstName: firstNameInput.value,
        lastName: lastNameInput.value,
      })
      .eq("id", user.id);

    if (error) {
      alert("Error saving name: " + error.message);
    } else {
      alert("Name changes saved!");
    }
  });

  // Update password
  document.getElementById("updateCredentialsBtn").addEventListener("click", async (e) => {
    e.preventDefault();

    if (!currentPassword.value || !newPassword.value) {
      alert("Please enter both current and new password.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword.value,
    });

    if (error) {
      alert("Password update failed: " + error.message);
    } else {
      alert("Password updated successfully.");
      currentPassword.value = "";
      newPassword.value = "";
    }
  });

  // Upload avatar
  avatarUpload.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const filePath = `${user.id}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert("Failed to upload avatar: " + uploadError.message);
      return;
    }

    // Update user record
    const { error: updateError } = await supabase
      .from("users")
      .update({ avatar: filePath })
      .eq("id", user.id);

    if (updateError) {
      alert("Uploaded avatar, but failed to update record: " + updateError.message);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    if (data?.publicUrl) {
      avatarEl.src = data.publicUrl;
      alert("Avatar updated!");
    }
  });
});
