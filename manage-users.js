// MANAGE USERS JS
let allUsers = [];
let currentEditingRow = null;
let currentMultiTarget = null;
let currentMultiType = null;

let currentSortColumn = null;
let currentSortDirection = "asc";

document.addEventListener("DOMContentLoaded", fetchUsers);

async function fetchUsers() {
  const res = await fetch(`${BASE_API}/users`);
  allUsers = await res.json();
  sortUsersBy("lastName"); // ✅ Default sort on load
}

function renderUserTable() {
  const tbody = document.getElementById("userTableBody");
  tbody.innerHTML = "";

  allUsers.forEach(user => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td><input value="${user.firstName || ""}" onchange="editUser(this, '${user.id}', 'firstName')" /></td>
      <td><input value="${user.lastName || ""}" onchange="editUser(this, '${user.id}', 'lastName')" /></td>
      <td><input value="${user.id || ""}" onchange="editUser(this, '${user.id}', 'id')" /></td>
      <td><input value="${user.email || ""}" onchange="editUser(this, '${user.id}', 'email')" /></td>
      <td><input value="${user.password || ""}" onchange="editUser(this, '${user.id}', 'password')" /></td>
      <td>
        ${user.avatar 
          ? `<img src="/Images/avatars/${user.avatar}.png" alt="Avatar" style="max-height: 40px; border-radius: 6px;" />`
          : '—'}
      </td>
      <td><button class="blue-button" onclick="openMultiSelect(this, '${user.id}', 'role')">${formatArray(user.roles || user.role)}</button></td>
      <td><button class="blue-button" onclick="openMultiSelect(this, '${user.id}', 'teacher')">${formatTeacherNames(user.teacher)}</button></td>
      <td><input value="${user.instrument || ""}" onchange="editUser(this, '${user.id}', 'instrument')" /></td>
    `;

    tbody.appendChild(tr);
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

function saveUser(user) {
  fetch(`${BASE_API}/users/${user.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  }).catch(err => console.error("Save error:", err));
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

  currentEditingRow[currentMultiType] = values.length > 1 ? values : values[0] || "";
  currentMultiTarget.textContent = values.join(", ");
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
    return teacherField.map(id => getUserFullNameById(id)).join(", ");
  } else {
    return getUserFullNameById(teacherField);
  }
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

    th.textContent = th.textContent.replace(/[\u25B2\u25BC]/g, "").trim();

    if (col === currentSortColumn) {
      const arrow = currentSortDirection === "asc" ? " ▲" : " ▼";
      th.textContent += arrow;
    }
  });
}

function goHome() {
  window.location.href = "home.html";
}
