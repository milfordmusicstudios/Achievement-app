
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://tpcjdgucyrqrzuqvshki.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwY2pkZ3VjeXJxcnp1cXZzaGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MDE5OTksImV4cCI6MjA2ODI3Nzk5OX0.XGHcwyeTzYje6cjd3PHQrr7CyyEcaoRB4GyTYN1fDqo'
);

// Global helper
function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}

let allUsers = [];

function closeUserSwitchModal() {
  document.getElementById("userSwitchModal").style.display = "none";
}

function closeRoleSwitchModal() {
  document.getElementById("roleSwitchModal").style.display = "none";
}

function handleLogout() {
  localStorage.clear();
  window.location.href = "index.html";
}

function saveSettings() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const updatedUser = {
    ...user,
    firstName: document.getElementById("firstName").value.trim(),
    lastName: document.getElementById("lastName").value.trim(),
    email: document.getElementById("newEmail").value.trim(),
    avatarUrl: user.avatarUrl || "",
    avatar: user.avatar || ""
  };

  const newPassword = document.getElementById("newPassword").value;
  if (newPassword) updatedUser.password = newPassword;

  supabase.from("users").update(updatedUser).eq("id", user.id).then(({ error }) => {
    if (error) {
      console.error("Save error:", error);
      alert("Could not save settings.");
      return;
    }

    localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
    const msg = document.createElement("div");
    msg.textContent = "Settings saved! Redirecting...";
    msg.style.cssText = "position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#3eb7f8;color:white;padding:12px 20px;border-radius:10px;font-weight:bold;z-index:999;";
    document.body.appendChild(msg);
    setTimeout(() => location.assign("home.html"), 1000);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const activeRole = localStorage.getItem("activeRole");
  if (!user || !activeRole) {
    alert("You must be logged in.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("firstName").value = user.firstName || "";
  document.getElementById("lastName").value = user.lastName || "";
  document.getElementById("newEmail").value = user.email || "";

  const avatarImage = document.getElementById("avatarImage");
  const avatarInput = document.getElementById("avatarInput");

  if (user.avatarUrl) {
    avatarImage.src = user.avatarUrl;
  } else {
    avatarImage.src = "avatars/default.png";
  }

  avatarImage.addEventListener("click", () => avatarInput.click());
  avatarInput.addEventListener("change", async () => {
    const file = avatarInput.files[0];
    if (!file) return;

    try {
      const path = `${user.id}/${file.name}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = data?.publicUrl;
      if (!publicUrl) throw new Error("Failed to retrieve public URL");

      user.avatarUrl = publicUrl;
      avatarImage.src = publicUrl;

      const { error: updateError } = await supabase.from("users").update({ avatarUrl: publicUrl }).eq("id", user.id);
      if (updateError) throw updateError;

      localStorage.setItem("loggedInUser", JSON.stringify(user));
    } catch (err) {
      console.error("Avatar upload error:", err);
      alert("Failed to upload avatar.");
    }
  });

  document.getElementById("saveBtn")?.addEventListener("click", saveSettings);
  document.getElementById("logoutBtn")?.addEventListener("click", handleLogout);
  document.getElementById("cancelBtn")?.addEventListener("click", () => window.location.href = "home.html");
  document.getElementById("cancelUserSwitchBtn")?.addEventListener("click", closeUserSwitchModal);
  document.getElementById("cancelRoleSwitchBtn")?.addEventListener("click", closeRoleSwitchModal);
});
