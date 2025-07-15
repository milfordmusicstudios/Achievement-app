// my-points.js

// Must be included AFTER config.js is loaded

let currentSortColumn = "date";
let currentSortDirection = "desc";
let userLogs = [];

document.addEventListener("DOMContentLoaded", async function () {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  // 🔹 Fetch logs
  let logs = [];
  try {
    const response = await fetch(`${BASE_API}/logs`);
    logs = await response.json();
  } catch (error) {
    console.error("Failed to load logs:", error);
    alert("Unable to load your logs. Try again later.");
    return;
  }

  // 🔹 Calculate level
  const { level } = calculateUserLevel(user.id, logs, levels);
  document.getElementById("myPointsBadge").src = level.badge;

  // 🔹 Avatar (optional)
  const avatarEl = document.getElementById("myPointsAvatar");
  if (avatarEl) {
    avatarEl.src = user.avatarUrl
      ? `${BASE_UPLOAD}${user.avatarUrl}`
      : `Images/avatars/${user.avatar || "default"}.png`;
  }

  // 🔹 Filter logs for this user
  userLogs = logs.filter(log =>
    log.user.toLowerCase() === user.id.toLowerCase()
  );

  // 🔹 Category summary
  const categoryStats = {};
  userLogs.forEach(log => {
    const category = log.category.toLowerCase();
    if (!categoryStats[category]) {
      categoryStats[category] = { points: 0, entries: 0 };
    }
    categoryStats[category].points += log.points;
    categoryStats[category].entries += 1;
  });

  const summarySection = document.getElementById("categorySummaries");
  if (summarySection) {
    summarySection.innerHTML = "";
    categories.forEach(cat => {
      const stats = categoryStats[cat.name.toLowerCase()] || { points: 0, entries: 0 };
      const div = document.createElement("div");
      div.className = "category-summary";
      div.innerHTML = `
        <img src="Images/Categories/${cat.icon}" alt="${cat.name}" />
        <p><strong>${cat.name}</strong></p>
        <p>Points: ${stats.points}</p>
        <p>Log Entries: ${stats.entries}</p>
      `;
      summarySection.appendChild(div);
    });
  // 🔹 Add total summary box
const totalPoints = userLogs.reduce((sum, log) => sum + log.points, 0);
const totalLogs = userLogs.length;

const totalDiv = document.createElement("div");
totalDiv.className = "category-summary";
totalDiv.innerHTML = `
  <img src="Images/Categories/AllCategories.png" alt="All Categories" />
  <p><strong>All Categories</strong></p>
  <p>Points: ${totalPoints}</p>
  <p>Log Entries: ${totalLogs}</p>
`;
summarySection.appendChild(totalDiv);

  }

  renderLogTable(); // 🔄 draw the log table
});

// 🔁 Table sorting and rendering
function renderLogTable() {
  const tableBody = document.getElementById("logTableBody");
  if (!tableBody) return;
  tableBody.innerHTML = "";

  const sorted = [...userLogs].sort((a, b) => {
    let aVal = a[currentSortColumn];
    let bVal = b[currentSortColumn];

    if (currentSortColumn === "date") {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    } else if (currentSortColumn === "points") {
      aVal = parseInt(aVal) || 0;
      bVal = parseInt(bVal) || 0;
    } else {
      aVal = (aVal || "").toString().toLowerCase();
      bVal = (bVal || "").toString().toLowerCase();
    }

    return currentSortDirection === "asc"
      ? aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      : aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
  });

  sorted.forEach(log => {
    const row = document.createElement("tr");

    const matchingCategory = categories.find(c =>
      c.name.toLowerCase() === log.category.toLowerCase()
    );
    const image = matchingCategory?.icon || "AllCategories.png";

    row.innerHTML = `
      <td><img src="Images/Categories/${image}" alt="${log.category}" class="table-category-image" /></td>
      <td>${log.points}</td>
      <td>${log.note || ""}</td>
      <td>
        ${new Date(log.date).toLocaleDateString(undefined, { dateStyle: "medium" })}<br>
        ${new Date(log.date).toLocaleTimeString(undefined, { timeStyle: "short" })}
      </td>
      <td>${log.status || "Pending"}</td>
    `;
    tableBody.appendChild(row);
  });

  updateSortArrows();
}

function sortLogs(column) {
  if (currentSortColumn === column) {
    currentSortDirection = currentSortDirection === "asc" ? "desc" : "asc";
  } else {
    currentSortColumn = column;
    currentSortDirection = column === "date" ? "desc" : "asc";
  }
  renderLogTable();
}

function updateSortArrows() {
  const columns = ["category", "points", "date", "status"];

  columns.forEach(col => {
    const arrowEl = document.getElementById(`sort-${col}`);
    if (!arrowEl) return;

    if (col === currentSortColumn) {
      arrowEl.textContent = currentSortDirection === "asc" ? "▲" : "▼";
      arrowEl.style.visibility = "visible";
    } else {
      arrowEl.textContent = "▲"; // neutral arrow for inactive columns
      arrowEl.style.visibility = "visible"; // always show
      arrowEl.style.opacity = "0.3"; // lightly dim inactive arrows (optional)
    }
  });
}
v