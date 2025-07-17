// script.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { getCurrentUser } from './auth.js';
import { calculateUserLevel } from './utils.js';

const supabase = createClient(
  'https://tpcjdgucyrqrzuqvshki.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwY2pkZ3VjeXJxcnp1cXZzaGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MDE5OTksImV4cCI6MjA2ODI3Nzk5OX0.XGHcwyeTzYje6cjd3PHQrr7CyyEcaoRB4GyTYN1fDqo'
);

document.addEventListener("DOMContentLoaded", async () => {
  const user = getCurrentUser();
  if (!user) return (window.location.href = "index.html");

  const { data: logs, error } = await supabase.from("logs").select("*");
  if (error) {
    console.error("Failed to fetch logs:", error.message);
    alert("Failed to load data.");
    return;
  }

  const userLogs = logs.filter(log => log.user === user.id);
  const userPoints = userLogs.reduce((total, log) => total + log.points, 0);

  const levels = [
    { level: 1, minPoints: 0, maxPoints: 9, image: "Level1.png" },
    { level: 2, minPoints: 10, maxPoints: 24, image: "Level2.png" },
    { level: 3, minPoints: 25, maxPoints: 49, image: "Level3.png" },
    { level: 4, minPoints: 50, maxPoints: 74, image: "Level4.png" },
    { level: 5, minPoints: 75, maxPoints: 99, image: "Level5.png" },
    { level: 6, minPoints: 100, maxPoints: 149, image: "Level6.png" },
    { level: 7, minPoints: 150, maxPoints: 199, image: "Level7.png" },
    { level: 8, minPoints: 200, maxPoints: 299, image: "Level8.png" },
    { level: 9, minPoints: 300, maxPoints: 499, image: "Level9.png" },
    { level: 10, minPoints: 500, maxPoints: 99999, image: "Level10.png" },
  ];

  const userLevel = levels.find(lvl => userPoints >= lvl.minPoints && userPoints <= lvl.maxPoints);
  const badgeElement = document.getElementById("levelBadge");
  if (userLevel && badgeElement) {
    badgeElement.src = `Images/Badges/${userLevel.image}`;
  }

  const summary = {};
  userLogs.forEach(log => {
    if (!summary[log.category]) {
      summary[log.category] = { points: 0, count: 0 };
    }
    summary[log.category].points += log.points;
    summary[log.category].count += 1;
  });

  const summaryContainer = document.getElementById("categorySummary");
  for (const category in summary) {
    const div = document.createElement("div");
    div.className = "category-box";
    div.innerHTML = `
      <img src="Images/Categories/${category}.png" alt="${category}" />
      <div><strong>Points</strong><br>${summary[category].points}</div>
      <div><strong>Log Entries</strong><br>${summary[category].count}</div>
    `;
    summaryContainer.appendChild(div);
  }

  const tableBody = document.getElementById("logTableBody");
  userLogs.forEach(log => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><img src="Images/Categories/${log.category}.png" alt="${log.category}" style="width:50px;" /></td>
      <td>${log.points}</td>
      <td>${log.note}</td>
      <td>${new Date(log.date).toLocaleString()}</td>
      <td>${log.status}</td>
    `;
    tableBody.appendChild(row);
  });
});