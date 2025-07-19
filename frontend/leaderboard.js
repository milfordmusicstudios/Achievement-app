import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { getCurrentUser } from './auth.js';
import { calculateUserLevel } from './utils.js';

const supabase = createClient(
  'https://tpcjdgucyrqrzuqvshki.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwY2pkZ3VjeXJxcnp1cXZzaGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MDE5OTksImV4cCI6MjA2ODI3Nzk5OX0.XGHcwyeTzYje6cjd3PHQrr7CyyEcaoRB4GyTYN1fDqo'
);

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

document.addEventListener("DOMContentLoaded", async () => {
  const user = getCurrentUser();
  if (!user) return (window.location.href = "index.html");

  try {
    const welcomeText = document.getElementById("welcomeText");
    const badge = document.getElementById("levelBadge");
    const bitmoji = document.getElementById("bitmojiImg");
    const levelText = document.getElementById("levelText");
    const progressFill = document.getElementById("progressFill");
    const percentText = document.getElementById("percentText");
    const myPointsBtn = document.getElementById("myPointsButton");

    if (welcomeText) welcomeText.textContent = `Welcome ${user.firstName}`;
    if (myPointsBtn)
      myPointsBtn.style.display = user.roles?.includes("student") ? "inline-block" : "none";

    // Avatar
    if (user.avatarUrl) {
      const { data: avatarData } = supabase.storage.from("avatars").getPublicUrl(user.avatarUrl);
      if (bitmoji && avatarData?.publicUrl) {
        bitmoji.src = avatarData.publicUrl;
      }
    }

    const { data: logs, error: logsError } = await supabase.from("logs").select("*");
    const { data: users, error: usersError } = await supabase.from("users").select("*");

    if (logsError || usersError) throw new Error("Failed to load leaderboard data");

    // Filter students
    const studentUsers = users.filter(u =>
      (Array.isArray(u.roles) ? u.roles : [u.roles]).includes("student")
    );

    // Calculate and render leaderboard
    const leaderboard = studentUsers.map(s => {
      const userLogs = logs.filter(l => l.user === s.id);
      const { level, percent, total } = calculateUserLevel(s.id, userLogs, levels);
      return {
        name: `${s.firstName} ${s.lastName}`,
        badge: level.badge,
        percent,
        level: level.level,
        total,
        avatar: s.avatarUrl || null,
      };
    });

    leaderboard.sort((a, b) => b.total - a.total);

    const listEl = document.getElementById("leaderboardList");
    if (listEl) {
      leaderboard.forEach(item => {
        const row = document.createElement("div");
        row.className = "leader-row";

        const avatar = document.createElement("img");
        avatar.className = "leader-avatar";
        if (item.avatar) {
          const { data: avatarData } = supabase.storage.from("avatars").getPublicUrl(item.avatar);
          avatar.src = avatarData.publicUrl || "avatars/default.png";
        } else {
          avatar.src = "avatars/default.png";
        }

        const text = document.createElement("span");
        text.textContent = `${item.name} - Level ${item.level} (${item.total} pts)`;

        row.appendChild(avatar);
        row.appendChild(text);
        listEl.appendChild(row);
      });
    }

    if (badge && levelText && progressFill && percentText) {
      const myLogs = logs.filter(l => l.user === user.id);
      const { level, percent } = calculateUserLevel(user.id, myLogs, levels);
      badge.src = level.badge;
      levelText.textContent = `Level ${level.level}`;
      progressFill.style.width = `${percent}%`;
      percentText.textContent = `${percent}%`;
    }

  } catch (err) {
    console.error("Leaderboard page error:", err.message || err);
  }
});