import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { getCurrentUser, getActiveRole, logout } from './auth.js';

const supabase = createClient(
  'https://tpcjdgucyrqrzuqvshki.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwY2pkZ3VjeXJxcnp1cXZzaGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MDE5OTksImV4cCI6MjA2ODI3Nzk5OX0.XGHcwyeTzYje6cjd3PHQrr7CyyEcaoRB4GyTYN1fDqo'
);

document.addEventListener("DOMContentLoaded", async () => {
  // ✅ Force session hydration
  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession();

  if (!session || sessionError) {
    alert("Session missing. Please log in again.");
    window.location.href = "index.html";
    return;
  }

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
  const logoutBtn = document.getElementById("logoutBtn");

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

  // Load data
  firstNameInput.value = user.firstName || "";
  lastNameInput.value = user.lastName || "";
  currentEmail.value = user.email || "";
  roleText.textContent = role;

  if (avatarEl && user.avatar) {
    const { data } = supabase.storage.from("avatars").getPublicUrl(user.avatar);
    if (data?.publicUrl) avatarEl.src = data.publicUrl;
  }

  if (user.roles?.length > 1) {
    switchRoleBtn.style.display = "inline-block";
    switchRoleBtn.addEventListener("click", () => {
      const currentIndex = user.roles.indexOf(role);
      const nextRole = user.roles[(currentIndex + 1) % user.roles.length];
      localStorage.setItem("activeRole", nextRole);
      location.reload();
    });
  }

  // ✅ Save name and refresh
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
      showMessage("Error saving name: " + error.message);
    } else {
      const { data: refreshedUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (fetchError) {
        showMessage("Saved, but couldn't refresh.");
      } else {
        localStorage.setItem("loggedInUser", JSON.stringify(refreshedUser));
        showMessage("Name update saved!");
      }
    }
  });

  // ✅ Password update — no token required if session initialized
  document.getElementById("updateCredentialsBtn").addEventListener("click", async (e) => {
    e.preventDefault();

    if (!currentPassword.value || !newPassword.value) {
      showMessage("Enter current and new password.");
      return;
    }

    const { error: pwError } = await supabase.auth.updateUser({
      password: newPassword.value
    });

    if (pwError) {
      showMessage("Password update failed: " + pwError.message);
    } else {
      showMessage("Password updated!");
      currentPassword.value = "";
      newPassword.value = "";
    }
  });

  // ✅ Upload avatar
  avatarUpload.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      showMessage("Avatar upload failed: " + uploadError.message);
      return;
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ avatar: filePath })
      .eq("id", user.id);

    if (updateError) {
      showMessage("Avatar saved, but user record failed.");
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    if (data?.publicUrl) {
      avatarEl.src = data.publicUrl;
      const updatedUser = { ...user, avatar: filePath };
      localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
      showMessage("Avatar updated!");
    }
  });

  // ✅ Logout
  logoutBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });
});
