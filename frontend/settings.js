// settings.js
// Must be included AFTER config.js is loaded
// Supabase is expected to be imported from config.js

// Global helper
function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}

let allUsers = [];

function promptUserSwitch() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const userList = allUsers.filter(u =>
    u.email && user.email &&
    u.email.toLowerCase() === user.email.toLowerCase()
  );

  const listContainer = document.getElementById("userSwitchList");
  listContainer.innerHTML = "";

  userList.forEach(u => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = "blue-button";
    btn.style = "margin: 5px 0; width: 100%;";

    let roleText = "";
    if (Array.isArray(u.roles)) {
      roleText = ` (${u.roles.join(", ")})`;
    } else if (Array.isArray(u.role)) {
      roleText = ` (${u.role.join(", ")})`;
    } else if (typeof u.role === "string") {
      roleText = ` (${u.role})`;
    }

    btn.textContent = `${u.firstName} ${u.lastName}${roleText}`;
    btn.onclick = () => {
      localStorage.setItem("loggedInUser", JSON.stringify(u));

      let rawRoles = u.roles || u.role || [];
      let roleList = Array.isArray(rawRoles) ? rawRoles : [rawRoles];
      roleList = roleList.map(r => r.toLowerCase());

      let defaultRole = "student";
      if (roleList.includes("admin")) {
        defaultRole = "admin";
      } else if (roleList.includes("teacher")) {
        defaultRole = "teacher";
      }

      localStorage.setItem("activeRole", defaultRole);
      window.location.href = "home.html";
    };

    li.appendChild(btn);
    listContainer.appendChild(li);
  });

  document.getElementById("userSwitchModal").style.display = "flex";
}

function promptRoleSwitch() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const roleList = Array.isArray(user.roles)
    ? user.roles
    : (Array.isArray(user.role) ? user.role : [user.role]);

  const listContainer = document.getElementById("roleSwitchList");
  listContainer.innerHTML = "";

  roleList.forEach(role => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = "blue-button";
    btn.style = "margin: 5px 0; width: 100%;";
    btn.textContent = capitalize(role);
    btn.onclick = () => {
      localStorage.setItem("activeRole", role);
      window.location.href = "home.html";
    };
    li.appendChild(btn);
    listContainer.appendChild(li);
  });

  document.getElementById("roleSwitchModal").style.display = "flex";
}

function closeUserSwitchModal() {
  document.getElementById("userSwitchModal").style.display = "none";
}

function closeRoleSwitchModal() {
  document.getElementById("roleSwitchModal").style.display = "none";
}

async function saveSettings() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const updatedUser = {
    ...user,
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    email: document.getElementById('newEmail').value.trim(),
    avatarUrl: user.avatarUrl || '',
    avatar: user.avatar || ''
  };

  const newPassword = document.getElementById('newPassword').value;
  if (newPassword) updatedUser.password = newPassword;

  try {
    const { error } = await supabase
      .from("users")
      .update(updatedUser)
      .eq("id", user.id);

    if (error) throw error;

    localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));

    const msg = document.createElement("div");
    msg.textContent = "Settings saved! Redirecting...";
    msg.style.cssText = "position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#3eb7f8;color:white;padding:12px 20px;border-radius:10px;font-weight:bold;z-index:999;";
    document.body.appendChild(msg);
    setTimeout(() => location.assign("home.html"), 1000);
  } catch (err) {
    console.error("Save error:", err);
    alert("Could not save settings.");
  }
}

function handleLogout() {
  localStorage.clear();
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem('loggedInUser'));
  const activeRole = localStorage.getItem("activeRole");
  if (!user || !activeRole) {
    alert("You must be logged in.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById('firstName').value = user.firstName || '';
  document.getElementById('lastName').value = user.lastName || '';
  document.getElementById('newEmail').value = user.email || '';

  const avatarImage = document.getElementById('avatarImage');
  if (user.avatarUrl) {
    const { data } = supabase.storage.from("avatars").getPublicUrl(user.avatarUrl);
    avatarImage.src = data?.publicUrl || `Images/avatars/default.png`;
  } else {
    avatarImage.src = `Images/avatars/default.png`;
  }

  const switchRoleBtn = document.getElementById("switchRoleBtn");
  const switchUserBtn = document.getElementById("switchUserBtn");

  const roles = Array.isArray(user.roles)
    ? user.roles
    : (Array.isArray(user.role) ? user.role : [user.role]);

  if (roles.length < 2 || !switchRoleBtn) {
    switchRoleBtn.style.display = "none";
  } else {
    switchRoleBtn.style.display = "inline-block";
    switchRoleBtn.textContent = `Switch Role (Currently: ${capitalize(activeRole)})`;
  }

  try {
    const { data, error } = await supabase.from("users").select("*");
    if (!error) allUsers = data;
  } catch {
    console.warn("Unable to load users for switch-user check.");
  }

  const sameEmailUsers = allUsers.filter(u =>
    u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase()
  );

  if (sameEmailUsers.length < 2 || !switchUserBtn) {
    switchUserBtn.style.display = "none";
  } else {
    switchUserBtn.style.display = "inline-block";
  }

  const avatarInput = document.getElementById("avatarInput");
  avatarImage.addEventListener("click", () => avatarInput.click());
  avatarInput.addEventListener("change", async () => {
    const file = avatarInput.files[0];
    if (!file) return;

    try {
      const path = `public/${user.id}/${file.name}`;

      const { error: uploadError } = await supabase
        .storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = data?.publicUrl;

      user.avatarUrl = path;
      avatarImage.src = publicUrl;

      const { error: updateError } = await supabase
        .from("users")
        .update({ avatarUrl: path })
        .eq("id", user.id);

      if (updateError) throw updateError;

      localStorage.setItem("loggedInUser", JSON.stringify(user));
    } catch (err) {
      console.error("Avatar upload error:", err);
      alert("Failed to upload avatar.");
    }
  });

  document.getElementById("saveBtn")?.addEventListener("click", saveSettings);
  document.getElementById("logoutBtn")?.addEventListener("click", handleLogout);
  document.getElementById("cancelBtn")?.addEventListener("click", () => {
    window.location.href = "home.html";
  });
  document.getElementById("switchRoleBtn")?.addEventListener("click", promptRoleSwitch);
  document.getElementById("switchUserBtn")?.addEventListener("click", promptUserSwitch);
  document.getElementById("cancelUserSwitchBtn")?.addEventListener("click", closeUserSwitchModal);
  document.getElementById("cancelRoleSwitchBtn")?.addEventListener("click", closeRoleSwitchModal);
});
