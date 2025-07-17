// leaderboard.js
// Must be included AFTER config.js is loaded

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

  // 🔹 Fetch users and logs from Supabase
  const [usersRes, logsRes] = await Promise.all([
    supabase.from("users").select("*"),
    supabase.from("logs").select("*")
  ]);

  if (usersRes.error || logsRes.error) {
    console.error("Error fetching leaderboard data:", usersRes.error || logsRes.error);
    return;
  }

  const users = usersRes.data;
  const logs = logsRes.data;

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

      const isStudent =
        (typeof user.roles === "string" && user.roles === "student") ||
        (Array.isArray(user.roles) && user.roles.includes("student"));

      if (
        isStudent &&
        stats.level.level === level.level &&
        (user.avatarUrl || user.avatar)
      ) {
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

        if (user.avatarUrl) {
          const { data: publicData } = supabase
            .storage
            .from("avatars")
            .getPublicUrl(user.avatarUrl);
          avatar.src = publicData?.publicUrl || `Images/avatars/default.png`;
        } else if (user.avatar) {
          avatar.src = `Images/avatars/${user.avatar}.png`;
        } else {
          avatar.src = `Images/avatars/default.png`;
        }

        avatar.alt = fullName;
        avatar.title = `${fullName} (${stats.totalPoints} pts)`;
        avatar.classList.add("avatar");
        avatar.style.left = `${adjustedLeft}%`;
        avatar.style.top = `${10 + bumpLevel * bumpY}px`;

        avatarTrack.appendChild(avatar);
      }
    });

    levelTrack.appendChild(avatarTrack);
    levelRow.appendChild(label);
    levelRow.appendChild(levelTrack);
    container.appendChild(levelRow);
  }
}
