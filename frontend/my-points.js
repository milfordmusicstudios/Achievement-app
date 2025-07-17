// my-points.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { getCurrentUser } from './auth.js';
import { calculateUserLevel } from './utils.js';

const supabase = createClient(
  'https://tpcjdgucyrqrzuqvshki.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwY2pkZ3VjeXJxcnp1cXZzaGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MDE5OTksImV4cCI6MjA2ODI3Nzk5OX0.XGHcwyeTzYje6cjd3PHQrr7CyyEcaoRB4GyTYN1fDqo'
);

const categories = ["Practice", "Participation", "Performance", "Improvement", "Teamwork"];

document.addEventListener("DOMContentLoaded", async () => {
  const user = getCurrentUser();
  if (!user) return (window.location.href = "index.html");

  const badgeImg = document.getElementById("myPointsBadge");
  const summaryContainer = document.getElementById("categorySummary");
  const logTableBody = document.getElementById("logTableBody");

  try {
    const { data: logs, error } = await supabase.from("logs").select("*");
    if (error) throw error;

    const userLogs = logs.filter(log => log.user === user.id);

    // Level calculation
    const levels = [
      { level: 1, minPoints: 0, maxPoints: 9, badge: "Images/Badges/Level1.png" },
      { level: 2, minPoints: 10, maxPoints: 24, badge: "Images/Badges/Level2.png" },
      { level: 3, minPoints: 25, maxPoints: 49, badge: "Images/Badges/Level3.png" },
      { level: 4, minPoints: 50, maxPoints: 74, badge: "Images/Badges/Level4.png" },
      { level: 5, minPoints: 75, maxPoints: 99, badge: "Images/Badges/Level5.png" },
      { level: 6, minPoints: 100, maxPoints: 149, badge: "Images/Badges/Level6.png" },
      { level: 7, minPoints: 150, maxPoints: 199, badge: "Images/Badges/Level7.png" },
      { level: 8, minPoints: 200, maxPoints: 299, badge: "Images/Badges/Level8.png" },
      { level: 9, minPoints: 300, maxPoints: 499, badge: "Images/Badges/Level9.png" },
      { level: 10, minPoints: 500, maxPoints: 99999, badge: "Images/Badges/Level10.png" },
    ];

    const { level } = calculateUserLevel(user.id, userLogs, levels);
    badgeImg.src = level.badge;

    // Summary display
    categories.forEach(category => {
      const catLogs = userLogs.filter(log => log.category === category);
      const totalPoints = catLogs.reduce((sum, log) => sum + log.points, 0);

      const summary = document.createElement("div");
      summary.classList.add("category-summary");

      const img = document.createElement("img");
      img.src = `Images/Categories/${category}.png`;
      img.alt = category;

      const text = document.createElement("div");
      text.innerHTML = `<strong>${category}</strong><br>Total Points: ${totalPoints}<br>Logs: ${catLogs.length}`;

      summary.appendChild(img);
      summary.appendChild(text);
      summaryContainer.appendChild(summary);
    });

    // Table display
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
    alert("Failed to load your points.");
  }
});