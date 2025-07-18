// review-logs.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { getCurrentUser } from './auth.js';

const supabase = createClient(
  'https://tpcjdgucyrqrzuqvshki.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwY2pkZ3VjeXJxcnp1cXZzaGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MDE5OTksImV4cCI6MjA2ODI3Nzk5OX0.XGHcwyeTzYje6cjd3PHQrr7CyyEcaoRB4GyTYN1fDqo'
);

const categories = ["Practice", "Participation", "Performance", "Improvement", "Teamwork"];

document.addEventListener("DOMContentLoaded", async () => {
  const user = getCurrentUser();
  if (!user || (!user.roles?.includes("admin") && !user.roles?.includes("teacher"))) {
    window.location.href = "index.html";
    return;
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

    const tableBody = document.getElementById("reviewLogTableBody");
    const summaryDiv = document.getElementById("categorySummary");

    // Category summary
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

    // Table
    const userMap = {};
    users.forEach(u => {
      userMap[u.id] = `${u.firstName} ${u.lastName}`;
    });

    logs.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(log => {
      const row = document.createElement("tr");

      const userCell = document.createElement("td");
      userCell.textContent = userMap[log.user] || log.user;

      const categoryCell = document.createElement("td");
      categoryCell.textContent = log.category;

      const pointsCell = document.createElement("td");
      pointsCell.textContent = log.points;

      const noteCell = document.createElement("td");
      noteCell.textContent = log.note || "";

      const dateCell = document.createElement("td");
      dateCell.textContent = new Date(log.date).toLocaleDateString();

      const statusCell = document.createElement("td");
      statusCell.textContent = log.status || "Pending";

      row.appendChild(userCell);
      row.appendChild(categoryCell);
      row.appendChild(pointsCell);
      row.appendChild(noteCell);
      row.appendChild(dateCell);
      row.appendChild(statusCell);

      tableBody.appendChild(row);
    });

  } catch (err) {
    console.error("Error loading review logs:", err);
    alert("Failed to load review logs.");
  }
});