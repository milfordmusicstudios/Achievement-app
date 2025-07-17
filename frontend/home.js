// home.js
// Must be included AFTER config.js is loaded

document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  let activeRole = localStorage.getItem("activeRole");

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // ✅ Force default role if missing or invalid
  if (!activeRole || activeRole === "undefined") {
    let rawRoles = user.roles || user.role || [];
    let roleList = Array.isArray(rawRoles) ? rawRoles : [rawRoles];
    roleList = roleList.map(r => r.toLowerCase());

    if (roleList.includes("admin")) {
      activeRole = "admin";
    } else if (roleList.includes("teacher")) {
      activeRole = "teacher";
    } else {
      activeRole = "student";
    }
    localStorage.setItem("activeRole", activeRole);
  }

  document.body.classList.add(`${activeRole}-mode`);

  const myPointsBtn = document.getElementById("myPointsBtn");
  if (activeRole !== "student" && myPointsBtn) {
    myPointsBtn.style.display = "none";
  }

  try {
    const { data: logs, error } = await supabase.from("logs").select("*");
    if (error) throw error;

    const { level, totalPoints, percent } = calculateUserLevel(user.id, logs, levels);

    localStorage.setItem("currentUser", JSON.stringify(user));
    document.getElementById('welcomeTitle').textContent = `Welcome ${user.firstName}!`;

    const { data: avatarData } = supabase.storage
      .from("avatars")
      .getPublicUrl(user.avatarUrl || `uploads/${user.avatar || "default"}.png`);

    document.getElementById('homeavatar').src =
      avatarData?.publicUrl || `Images/avatars/default.png`;

    const badge = document.getElementById('homeBadge');
    const progressCard = document.querySelector('.progress-card');
    const progressText = document.getElementById('homeProgressText');

    if (activeRole === "teacher") {
      badge.src = "Images/LevelBadges/teacher.png";
      progressCard.style.display = "none";
      progressText.style.display = "none";
    } else if (activeRole === "admin") {
      badge.src = "Images/LevelBadges/admin.png";
      progressCard.style.display = "none";
      progressText.style.display = "none";
    } else {
      badge.src = level.badge;
      document.getElementById('homeProgressBar').style.width = `${percent}%`;
      document.getElementById('homeProgressBar').style.backgroundColor = level.color;
      progressText.textContent = `${percent}% to next level`;
      if (myPointsBtn) myPointsBtn.style.display = "inline-block";
    }

    const reviewLogsBtn = document.getElementById("reviewLogsBtn");
    const manageUsersBtn = document.getElementById("manageUsersBtn");

    if (activeRole === "admin") {
      if (manageUsersBtn) manageUsersBtn.style.display = "inline-block";
      if (reviewLogsBtn) reviewLogsBtn.style.display = "inline-block";
    } else if (activeRole === "teacher") {
      if (manageUsersBtn) manageUsersBtn.style.display = "none";
      if (reviewLogsBtn) reviewLogsBtn.style.display = "inline-block";
    } else {
      if (manageUsersBtn) manageUsersBtn.style.display = "none";
      if (reviewLogsBtn) reviewLogsBtn.style.display = "none";
    }

    user.level = level.name;
    localStorage.setItem('loggedInUser', JSON.stringify(user));

  } catch (error) {
    console.error("Error fetching logs:", error);
    alert("Unable to load points. Please try again.");
  }
});

function goToManageUsers() {
  window.location.href = "manage-users.html";
}
