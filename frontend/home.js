// home.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { getCurrentUser } from './auth.js';
import { calculateUserLevel } from './utils.js';

const supabase = createClient(
  'https://tpcjdgucyrqrzuqvshki.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwY2pkZ3VjeXJxcnp1cXZzaGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MDE5OTksImV4cCI6MjA2ODI3Nzk5OX0.XGHcwyeTzYje6cjd3PHQrr7CyyEcaoRB4GyTYN1fDqo'
);

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

document.addEventListener("DOMContentLoaded", async () => {
  const user = getCurrentUser();
  if (!user) return (window.location.href = "index.html");

  const welcomeEl = document.getElementById("welcomeTitle");
  const avatarEl = document.getElementById("homeavatar");
  const badgeEl = document.getElementById("homeBadge");
  const progressBar = document.getElementById("homeProgressBar");
  const percentEl = document.getElementById("homeProgressText");

  if (welcomeEl) welcomeEl.textContent = `Welcome ${user.firstName}`;

  try {
    // Get avatar image
    if (user.avatarUrl) {
      const { data: avatarData } = supabase.storage.from("avatars").getPublicUrl(user.avatarUrl);
      if (avatarEl && avatarData?.publicUrl) {
        avatarEl.src = avatarData.publicUrl;
      }
    }

    // Get logs
    const { data: logs, error } = await supabase.from("logs").select("*");
    if (error) throw error;

    const { level, percent } = calculateUserLevel(user.id, logs, levels);

    if (badgeEl) badgeEl.src = level.badge;
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (percentEl) percentEl.textContent = `${percent}% to next level`;
  } catch (err) {
    console.error("Home page error:", err.message || err);
  }
});