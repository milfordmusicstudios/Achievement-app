// Must be included AFTER config.js is loaded
// Example usage:
fetch(`${BASE_API}/users`)
//img.src = `${BASE_UPLOAD}${user.avatarUrl}`;


window.addEventListener("load", () => {
  generateLeaderboard();
});

async function generateLeaderboard() {
  const container = document.getElementById("leaderboardContainer");
  if (!container) {
    console.error("leaderboardContainer not found in the DOM.");
    return;
  }

  container.innerHTML = "";

  // 🔹 Fetch data from backend
  const [users, logs] = await Promise.all([
fetchData(`${BASE_API}/users`),
fetchData(`${BASE_API}/logs`)
  ]);

  // 🔹 Sort levels from highest to lowest
  const sortedLevels = [...levels].sort((a, b) => b.level - a.level);

  for (const level of sortedLevels) {
    const levelRow = document.createElement("div");
    levelRow.classList.add("level-row");

    // 🔹 Add badge on the left
    const label = document.createElement("div");
    label.classList.add("level-label");

    const badgeImg = document.createElement("img");
    badgeImg.src = level.badge;
    badgeImg.alt = `Level ${level.level}`;
    badgeImg.classList.add("level-badge-icon");
    label.appendChild(badgeImg);

    // 🔹 Create level track
    const levelTrack = document.createElement("div");
    levelTrack.classList.add("level-track");
    levelTrack.style.backgroundColor = level.color;

    const avatarTrack = document.createElement("div");
    avatarTrack.classList.add("avatar-track");

    const placedAvatars = [];

    users.forEach(user => {
      const stats = calculateUserLevel(user.id, logs, levels);
console.log("Checking user:", user.firstName, {
  id: user.id,
  avatarUrl: user.avatarUrl,
  avatar: user.avatar
});

const isStudent =
  (typeof user.roles === "string" && user.roles === "student") ||
  (Array.isArray(user.roles) && user.roles.includes("student"));

if (
  isStudent &&
  stats.level.level === level.level &&
  (user.avatarUrl || user.avatar)
)
      {
        const fullName = `${user.firstName} ${user.lastName}`;
        const baseLeft = stats.percent;

        const spacingThreshold = 3;
        const bumpX = 6;
        const bumpY = 22;
        const maxStack = 3;

        let bumpLevel = 0;
        let adjustedLeft = baseLeft;

        // Resolve overlap
        while (placedAvatars.some(p =>
          Math.abs(p.left - adjustedLeft) < spacingThreshold && p.top === bumpLevel
        )) {
          bumpLevel++;
          if (bumpLevel >= maxStack) {
            bumpLevel = 0;
            adjustedLeft += bumpX;
          }
        }

        placedAvatars.push({ left: adjustedLeft, top: bumpLevel });

        const avatar = document.createElement("img");

        // ✅ Proper avatar fallback logic
if (user.avatarUrl) {
avatar.src = `${BASE_UPLOAD}${user.avatarUrl}`;
} else if (user.avatar) {
avatar.src = user.avatarUrl
  ? `${BASE_UPLOAD}${user.avatarUrl}`
  : `${BASE_UPLOAD}/uploads/${user.avatar}.png`;
} else {
  avatar.src = `Images/avatars/default.png`;
}

        avatar.alt = fullName;
        avatar.title = `${fullName} (${stats.totalPoints} pts)`;
        avatar.classList.add("avatar");
        avatar.style.left = `${adjustedLeft}%`;
        avatar.style.top = `${10 + bumpLevel * bumpY}px`;

        console.log("Rendering avatar for:", user.firstName, {
          avatarUrl: user.avatarUrl,
          avatar: user.avatar,
          left: adjustedLeft,
          top: bumpLevel
        });
console.log("Appending avatar to DOM for:", fullName, avatar.src);

        avatarTrack.appendChild(avatar);
      }
    });

    levelTrack.appendChild(avatarTrack);
    levelRow.appendChild(label);        // Badge first
    levelRow.appendChild(levelTrack);   // Then the track
    container.appendChild(levelRow);
  }
}

async function fetchData(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`Error fetching ${url}:`, err);
    return [];
  }
}
