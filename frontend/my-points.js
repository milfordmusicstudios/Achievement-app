import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { getCurrentUser } from './auth.js';
import { calculateUserLevel } from './utils.js';

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
  if (!user) return (window.location.href = "index.html");

  const badgeImg = document.getElementById("myPointsBadge");
  const summaryContainer = document.getElementById("categorySummaries");
  const logTableBody = document.getElementById("logTableBody");

  try {
    const { data: logs, error } = await supabase.from("logs").select("*");
    if (error) throw error;

    const userLogs = logs.filter(log => log.user === user.id);

    // Calculate level and update badge
    const levels = [
      { level: 1, minPoints: 0, maxPoints: 9, badge: "images/badges/level1.png" },
      { level: 2, minPoints: 10, maxPoints: 24, badge: "images/badges/level2.png" },
      { level: 3, minPoints: 25, maxPoints: 49, badge: "images/badges/level3.png" },
      { level: 4, minPoints: 50, maxPoints: 74, badge: "images/badges/level4.png" },
      { level: 5, minPoints: 75, maxPoints: 99, badge: "images/badges/level5.png" },
      { level: 6, minPoints: 100, maxPoints: 149, badge: "images/badges/level6.png" },
      { level: 7, minPoints: 150, maxPoints: 199, badge: "images/badges/level7.png" },
      { level: 8, minPoints: 200, maxPoints: 299, badge: "images/badges/level8.png" },
      { level: 9, minPoints: 300, maxPoints: 499, badge: "images/badges/level9.png" },
      { level: 10, minPoints: 500, maxPoints: 99999, badge: "images/badges/level10.png" },
    ];

    const { level } = calculateUserLevel(user.id, userLogs, levels);
    badgeImg.src = level.badge;

    // Category summaries
    categories.forEach(category => {
      const catLogs = userLogs.filter(log => log.category === category);
      const totalPoints = catLogs.reduce((sum, log) => sum + log.points, 0);

      const summary = document.createElement("div");
      summary.classList.add("category-summary");

      const img = document.createElement("img");
      img.src = `images/categories/${category}.png`;
      img.alt = category;

      const text = document.createElement("div");
      text.innerHTML = `<strong>${category}</strong><br>Total Points: ${totalPoints}<br>Logs: ${catLogs.length}`;

      summary.appendChild(img);
      summary.appendChild(text);
      summaryContainer.appendChild(summary);
    });

    // Log table
    userLogs.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(log => {
      const row = document.createElement("tr");

      const dateCell = document.createElement("td");
      dateCell.textContent = log.date;

      const catCell = document.createElement("td");
      catCell.textContent = log.category;

      const pointsCell = document.createElement("td");
      pointsCell.textContent = log.points;

      const noteCell = document.createElement("td");
      noteCell.textContent = log.note || "";

      row.appendChild(dateCell);
      row.appendChild(catCell);
      row.appendChild(pointsCell);
      row.appendChild(noteCell);
      logTableBody.appendChild(row);
    });

  } catch (err) {
    console.error("Error loading my points page:", err.message || err);
    showMessage("Failed to load your points.");
  }
});
