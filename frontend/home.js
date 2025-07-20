// home.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { getCurrentUser, getActiveRole } from './auth.js';
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
  const role = getActiveRole();
  if (!user) return (window.location.href = "index.html");

  const welcomeEl = document.getElementById("welcomeTitle");
  const avatarEl = document.getElementById("homeavatar");
  const badgeEl = document.getElementById("homeBadge");
  const progressBar = document.getElementById("homeProgressBar");
  const percentEl = document.getElementById("homeProgressText");
  const myPointsBtn = document.getElementById("myPointsButton");

  if (welcomeEl) welcomeEl.textContent = `Welcome ${user.firstName}`;

  try {
    // Load avatar from public URL
    if (avatarEl && user.avatarUrl) {
      avatarEl.src = user.avatarUrl;
      avatarEl.alt = `${user.firstName}'s Avatar`;
    }

    // Hide "My Points" and progress for admin/teacher
    if (role !== "student") {
      if (myPointsBtn) myPointsBtn.style.display = "none";
      if (progressBar) progressBar.style.display = "none";
      if (percentEl) percentEl.style.display = "none";
      if (badgeEl) badgeEl.src = `images/badges/${role}.png`;
    } else {
      // Student badge and progress
      const { data: logs, error } = await supabase.from("logs").select("*");
      if (error) throw error;
      const { level, percent } = calculateUserLevel(user.id, logs, levels);
      if (badgeEl) badgeEl.src = level.badge;
      if (progressBar) progressBar.style.width = `${percent}%`;
      if (percentEl) percentEl.textContent = `${percent}% to next level`;
    }
  } catch (err) {
    console.error("Home page error:", err.message || err);
  }
});
