// manage-users.js

let allUsers = [];
let currentEditingRow = null;
let currentMultiTarget = null;
let currentMultiType = null;

let currentSortColumn = null;
let currentSortDirection = "asc";

document.addEventListener("DOMContentLoaded", () => {
  fetchUsers();
  document.getElementById("addUserBtn")?.addEventListener("click", addUser);
});

async function fetchUsers() {
  const { data, error } = await supabase.from("users").select("*");
  if (error) {
    console.error("Error loading users:", error.message);
    return;
  }
  allUsers = data;
  sortUsersBy("lastName");
}

function renderUserTable() {
  const tbody = document.getElementById("userTableBody");
  tbody.innerHTML = "";

  allUsers.forEach(user => {
    const tr = document.createElement("tr");

    const avatarPath = user.avatarUrl || `uploads/${user.avatar || "default"}.png`;
    const { data: avatarData } = supabase.storage.from("avatars").getPublicUrl(avatarPath);
    const avatarUrl = avatarData?.publicUrl || `Images/avatars/default.png`;

    tr.innerHTML = `
      <td><input value="${user.firstName || ""}" onchange="editUser(this, '${user.id}', 'firstName')" /></td>
      <td><input value="${user.lastName || ""}" onchange="editUser(this, '${user.id}', 'lastName')" /></td>
      <td><input value="${user.id || ""}" onchange="editUser(this, '${user.id}', 'id')" /></td>
      <td><input value="${user.email || ""}" onchange="editUser(this, '${user.id}', 'email')" /></td>
      <td><input value="${user.password || ""}" onchange="editUser(this, '${user.id}', 'password')" /></td>
      <td>
        <img src="${avatarUrl}" alt="Avatar" style="max-height: 40px; border-radius: 6px;" />
        <input type="file" data-user-id="${user.id}" class="avatar-upload" style="display:block;margin-top:4px;" />
      </td>
      <td><button class="blue-button" onclick="openMultiSelect(this, '${user.id}', 'role')">${formatArray(user.roles || user.role)}</button></td>
      <td><button class="blue-button" onclick="openMultiSelect(this, '${user.id}', 'teacher')">${formatTeacherNames(user.teacher)}</button></td>
      <td><input value="${user.instrument || ""}" onchange="editUser(this, '${user.id}', 'instrument')" /></td>
    `;

    tbody.appendChild(tr);
  });

  setupAvatarUploadHandlers();
}

function setupAvatarUploadHandlers() {
  document.querySelectorAll(".avatar-upload").forEach(input => {
    input.addEventListener("change", async (e) => {
      const userId = e.target.dataset.userId;
      const file = e.target.files[0];
      if (!file) return;

      const filePath = `public/${userId}/${file.name}`;

      try {
        const { error: uploadError } = await supabase
          .storage
          .from("avatars")
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { error: updateError } = await supabase
          .from("users")
          .update({ avatarUrl: filePath })
          .eq("id", userId);

        if (updateError) throw updateError;

        const user = allUsers.find(u => u.id === userId);
        user.avatarUrl = filePath;
        saveUser(user);
        fetchUsers();
      } catch (err) {
        console.error("Avatar upload failed:", err);
        alert("Avatar upload failed.");
      }
    });
  });
}

function formatArray(value) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "string") return value;
  return "";
}

function editUser(input, id, field) {
  const user = allUsers.find(u => u.id === id);
  if (!user) return;
  user[field] = input.value;
  saveUser(user);
}

async function saveUser(user) {
  try {
    const { error } = await supabase
      .from("users")
      .update(user)
      .eq("id", user.id);
    if (error) throw error;
  } catch (err) {
    console.error("Save error:", err);
    alert("Failed to save user.");
  }
}

function openMultiSelect(button, userId, type) {
  const user = allUsers.find(u => u.id === userId);
  if (!user) return;
  currentEditingRow = user;
  currentMultiTarget = button;
  currentMultiType = type;

  const modal = document.getElementById("multiSelectModal");
  const title = document.getElementById("multiSelectTitle");
  const optionsBox = document.getElementById("multiSelectOptions");
  optionsBox.innerHTML = "";

  let allOptions = [];
  if (type === "role") {
    allOptions = ["student", "teacher", "admin"];
    title.textContent = "Select Role(s)";
  } else if (type === "teacher") {
    const teacherUsers = allUsers.filter(u => {
      const roles = Array.isArray(u.roles) ? u.roles : [u.roles];
      return roles.includes("teacher") || roles.includes("admin");
    });

    allOptions = teacherUsers.map(u => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`
    }));

    allOptions.unshift({ id: "", name: "— None —" });
    title.textContent = "Select Teacher(s)";
  }

  const selected = Array.isArray(user[currentMultiType]) ? user[currentMultiType] : [user[currentMultiType]];

  allOptions.forEach(opt => {
    const label = document.createElement("label");
    label.className = "multi-check-option";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = opt.id || opt;
    input.checked = selected.includes(opt.id || opt);

    label.appendChild(input);
    label.appendChild(document.createTextNode(" " + (opt.name || opt)));
    optionsBox.appendChild(label);
  });

  modal.style.display = "flex";
}

function confirmMultiSelect() {
  const checks = document.querySelectorAll("#multiSelectOptions input[type='checkbox']");
  const values = Array.from(checks).filter(c => c.checked).map(c => c.value);

  const cleaned =
    values.length === 0 ? "" :
    values.length === 1 ? values[0] :
    values;

  currentEditingRow[currentMultiType] = cleaned;
  currentMultiTarget.textContent = formatTeacherNames(cleaned);
  saveUser(currentEditingRow);
  closeMultiSelectModal();
}

function closeMultiSelectModal() {
  document.getElementById("multiSelectModal").style.display = "none";
}

function getUserFullNameById(userId) {
  const user = allUsers.find(u => u.id === userId);
  return user ? `${user.firstName} ${user.lastName}` : '';
}

function formatTeacherNames(teacherField) {
  if (Array.isArray(teacherField)) {
    return teacherField.map(getTeacherNameFromValue).join(", ");
  } else {
    return getTeacherNameFromValue(teacherField);
  }
}

function getTeacherNameFromValue(val) {
  if (!val) return "No Teacher";
  if (typeof val === "object") {
    if (val.firstName && val.lastName) {
      return `${val.firstName} ${val.lastName}`;
    }
    return "No Teacher";
  }
  return getUserFullNameById(val) || "No Teacher";
}

function getSortValue(user, column) {
  switch (column) {
    case "firstName":
    case "lastName":
    case "id":
    case "email":
    case "instrument":
      return (user[column] || "").toString().toLowerCase();

    case "role":
    case "roles":
      const roles = Array.isArray(user.roles) ? user.roles : [user.roles || user.role || ""];
      return roles.join(", ").toLowerCase();

    case "teacher":
      const teacherNames = Array.isArray(user.teacher)
        ? user.teacher.map(getUserFullNameById).join(", ")
        : getUserFullNameById(user.teacher);
      return (teacherNames || "").toLowerCase();

    default:
      return "";
  }
}

function sortUsersBy(column) {
  if (currentSortColumn === column) {
    currentSortDirection = currentSortDirection === "asc" ? "desc" : "asc";
  } else {
    currentSortColumn = column;
    currentSortDirection = "asc";
  }

  allUsers.sort((a, b) => {
    const valA = getSortValue(a, column);
    const valB = getSortValue(b, column);
    const comparison = valA.localeCompare(valB);
    return currentSortDirection === "asc" ? comparison : -comparison;
  });

  renderUserTable();
  updateSortIndicators();
}

function updateSortIndicators() {
  const headers = document.querySelectorAll("#userTable thead th");

  headers.forEach(th => {
    const col = th.getAttribute("data-column");
    if (!col) return;

    th.textContent = th.textContent.replace(/[▲▼]/g, "").trim();

    if (col === currentSortColumn) {
      const arrow = currentSortDirection === "asc" ? " ▲" : " ▼";
      th.textContent += arrow;
    }
  });
}

function goHome() {
  window.location.href = "home.html";
}
