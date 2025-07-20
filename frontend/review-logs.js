import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { getCurrentUser } from './auth.js';

const supabase = createClient(
  'https://tpcjdgucyrqrzuqvshki.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
);

const categories = ["Practice", "Participation", "Performance", "Improvement", "Teamwork"];

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

document.addEventListener("DOMContentLoaded", async () => {
  const user = getCurrentUser();
  if (!user || (!user.roles?.includes("admin") && !user.roles?.includes("teacher"))) {
    return window.location.href = "index.html";
  }

  try {
    const [userResult, logResult] = await Promise.all([
      supabase.from("users").select("*"),
      supabase.from("logs").select("*")
    ]);

    if (userResult.error || logResult.error) {
      throw userResult.error || logResult.error;
    }

    const users = userResult.data;
    const logs = logResult.data;
    const summaryDiv = document.getElementById("categorySummaries");
    const tableBody = document.getElementById("reviewTableBody");

    const summary = {};
    categories.forEach(cat => (summary[cat] = { count: 0, points: 0 }));

    logs.forEach(log => {
      if (summary[log.category]) {
        summary[log.category].count++;
        summary[log.category].points += log.points;
      }
    });

    for (const category of categories) {
      const div = document.createElement("div");
      div.className = "category-summary";
      div.innerHTML = `
        <img src="images/categories/${category}.png" alt="${category}" />
        <div><strong>${category}</strong><br>Logs: ${summary[category].count}<br>Points: ${summary[category].points}</div>
      `;
      summaryDiv.appendChild(div);
    }

    const userMap = {};
    users.forEach(u => {
      userMap[u.id] = `${u.firstName} ${u.lastName}`;
    });

    logs.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(log => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${userMap[log.user] || log.user}</td>
        <td>${log.category}</td>
        <td>${log.points}</td>
        <td>${log.note || ""}</td>
        <td>${new Date(log.date).toLocaleDateString()}</td>
        <td>${log.status || "Pending"}</td>
      `;

      tableBody.appendChild(row);
    });

  } catch (err) {
    console.error("Error loading review logs:", err.message || err);
    showMessage("Failed to load logs.");
  }
});
