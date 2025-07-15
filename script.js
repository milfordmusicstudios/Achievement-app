// Must be included AFTER config.js is loaded
// Example usage:
fetch(`${BASE_API}/users`)
//img.src = `${BASE_UPLOAD}${user.avatarUrl}`;


const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
const userLogs = logs.filter(log => log.user === currentUser.id);

// Show level badge
const userPoints = userLogs.reduce((total, log) => total + log.points, 0);
const userLevel = levels.find(lvl => userPoints >= lvl.minPoints && userPoints <= lvl.maxPoints);
document.getElementById("levelBadge").src = `Images/Badges/${userLevel.image}`;
if (userLevel) {
  document.getElementById("levelBadge").src = `Images/Badges/${userLevel.image}`;
} else {
  console.warn("No userLevel found");
}

// Summarize logs by category
const summary = {};
userLogs.forEach(log => {
  if (!summary[log.category]) {
    summary[log.category] = { points: 0, count: 0 };
  }
  summary[log.category].points += log.points;
  summary[log.category].count += 1;
});

// Display category summaries
const summaryContainer = document.getElementById("categorySummary");
for (const category in summary) {
  const categoryData = categories.find(cat => cat.name === category);
  const div = document.createElement("div");
  div.className = "category-box";
  div.innerHTML = `
    <img src="Images/Categories/${categoryData.image}" alt="${category}" />
    <div><strong>Points</strong><br>${summary[category].points}</div>
    <div><strong>Log Entries</strong><br>${summary[category].count}</div>
  `;
  summaryContainer.appendChild(div);
}

// Fill log table
const tableBody = document.getElementById("logTableBody");
userLogs.forEach(log => {
  const categoryData = categories.find(cat => cat.name === log.category);
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><img src="Images/Categories/${categoryData.image}" alt="${log.category}" style="width:50px;" /></td>
    <td>${log.points}</td>
    <td>${log.note}</td>
    <td>${new Date(log.date).toLocaleString()}</td>
    <td>${log.status}</td>
  `;
  tableBody.appendChild(row);
});
