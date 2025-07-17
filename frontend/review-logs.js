// Must be included AFTER config.js is loaded
// Example usage:
fetch(`${BASE_API}/users`)

const user = JSON.parse(localStorage.getItem("loggedInUser"));
const activeRole = localStorage.getItem("activeRole");

if (!user || !["admin", "teacher"].includes(activeRole)) {
  alert("You are not authorized to view this page.");
  window.location.href = "home.html";
}

let logs = [];
let users = [];
let currentSortField = "date";
let currentSortOrder = "desc";

let teacherStudentIds = [];

// Load and filter data

document.addEventListener("DOMContentLoaded", async () => {
  try {
const [{ data: logsData, error: logsError }, { data: usersData, error: usersError }] = await Promise.all([
  supabase.from("logs").select("*"),
  supabase.from("users").select("*")
]);

if (logsError || usersError) throw logsError || usersError;

logs = logsData;
users = usersData;

    if (activeRole === "teacher") {
      teacherStudentIds = users
        .filter(u => {
          const roles = u.roles || u.role || [];
          const roleList = Array.isArray(roles) ? roles : [roles];
          if (!roleList.includes("student")) return false;

          const teacherField = u.teacher || u.teachers || [];
          const teacherList = Array.isArray(teacherField) ? teacherField : [teacherField];
          return teacherList.includes(user.id);
        })
        .map(u => u.id);
    }

    renderCategorySummaries();
    sortLogsBy("date");
  } catch (err) {
    console.error("Error loading logs or users:", err);
    alert("Unable to load logs. Please try again later.");
  }
});

function renderCategorySummaries() {
  const categoryStats = {};
  logs.forEach(log => {
    if (activeRole === "teacher" && !teacherStudentIds.includes(log.user)) return;
    const cat = log.category.toLowerCase();
    if (!categoryStats[cat]) {
      categoryStats[cat] = { points: 0, entries: 0 };
    }
    categoryStats[cat].points += log.points;
    categoryStats[cat].entries += 1;
  });

  const wrapper = document.getElementById("categorySummaries");
  wrapper.innerHTML = "";
  categories.forEach(cat => {
    const stat = categoryStats[cat.name.toLowerCase()] || { points: 0, entries: 0 };
    const div = document.createElement("div");
    div.className = "category-summary";
    div.innerHTML = `
      <img src="Images/Categories/${cat.icon}" alt="${cat.name}" />
      <p><strong>${cat.name}</strong></p>
      <p>Points: ${stat.points}</p>
      <p>Logs: ${stat.entries}</p>
    `;
    wrapper.appendChild(div);
  });
}

function sortLogsBy(field) {
  const tableHeadings = document.querySelectorAll("th");
  tableHeadings.forEach(th => {
    th.innerHTML = th.textContent.split(" ")[0];
  });

  if (currentSortField === field) {
    currentSortOrder = currentSortOrder === "asc" ? "desc" : "asc";
  } else {
    currentSortField = field;
    currentSortOrder = "asc";
  }

  logs.sort((a, b) => {
    let aVal = a[field] || "";
    let bVal = b[field] || "";

    if (field === "date") {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    } else if (field === "points") {
      aVal = parseInt(aVal, 10) || 0;
      bVal = parseInt(bVal, 10) || 0;
    } else if (field === "status") {
      const statusOrder = {
        "approved": 1,
        "pending": 2,
        "not approved": 3,
        "needs info": 4
      };
      aVal = statusOrder[aVal.toLowerCase()] || 999;
      bVal = statusOrder[bVal.toLowerCase()] || 999;
    } else {
      aVal = aVal.toString().toLowerCase();
      bVal = bVal.toString().toLowerCase();
    }

    if (aVal < bVal) return currentSortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return currentSortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const sortArrow = currentSortOrder === "asc" ? " ▲" : " ▼";
  const activeHeader = document.querySelector(`th[onclick*="${field}"]`);
  if (activeHeader) activeHeader.innerHTML = activeHeader.textContent.trim() + sortArrow;

  renderReviewTable();
}

function renderReviewTable() {
  const tbody = document.getElementById("reviewTableBody");
  tbody.innerHTML = "";

  logs.forEach(log => {
    if (!log.id) return;
    if (activeRole === "teacher" && !teacherStudentIds.includes(log.user)) return;

    const userObj = users.find(u => u.id === log.user);
    const fullName = userObj ? `${userObj.firstName} ${userObj.lastName}` : log.user;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="user-cell">${fullName}</td>
      <td><input class="category-input" value="${log.category}" data-id="${log.id}" /></td>
      <td><input class="points-input" type="number" value="${log.points}" data-id="${log.id}" /></td>
      <td><input class="note-input" value="${log.note || ""}" data-id="${log.id}" /></td>
      <td><input class="date-input" type="date" value="${log.date}" data-id="${log.id}" /></td>
      <td>
        <select class="status-input" data-id="${log.id}">
          <option value="pending" ${log.status === "pending" ? "selected" : ""}>Pending</option>
          <option value="approved" ${log.status === "approved" ? "selected" : ""}>Approved</option>
          <option value="not approved" ${log.status === "not approved" ? "selected" : ""}>Not Approved</option>
          <option value="needs info" ${log.status === "needs info" ? "selected" : ""}>Needs Info</option>
        </select>
      </td>
    `;

    tbody.appendChild(row);
  });

  tbody.querySelectorAll("input, select").forEach(el => {
    el.addEventListener("change", () => {
      const logId = el.dataset.id;
      const field = el.className.split("-")[0];
      if (!logId || !field) return;
      updateLogField(logId, field, el.value);
    });
  });
}

async function updateLogField(logId, field, value) {
  const payload = {
    [field]: field === "points" ? parseInt(value, 10) : value
  };

  try {
const { error } = await supabase
  .from("logs")
  .update(payload)
  .eq("id", logId);

if (error) throw error;

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Server responded ${res.status}: ${errText}`);
    }
  } catch (err) {
    console.error(`❌ Failed to update ${field} for log ${logId}:`, err);
    alert("Error updating log. Please try again.");
  }
}