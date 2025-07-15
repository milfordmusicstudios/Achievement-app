// Must be included AFTER config.js is loaded
// Example usage:
fetch(`${BASE_API}/users`)
//img.src = `${BASE_UPLOAD}${user.avatarUrl}`;


function calculateUserLevel(userId, logs, levels) {
  const userLogs = logs.filter(log => log.user === userId);
  const totalPoints = userLogs.reduce((sum, log) => sum + log.points, 0);

  let currentLevel = levels.find(level =>
    totalPoints >= level.minPoints && totalPoints <= level.maxPoints
  );

  if (!currentLevel) {
    currentLevel = levels[levels.length - 1];
  }

  const levelRange = currentLevel.maxPoints - currentLevel.minPoints;
  const pointsIntoLevel = totalPoints - currentLevel.minPoints;
  const percent = Math.min(100, Math.round((pointsIntoLevel / levelRange) * 100));

  return {
    level: currentLevel,
    totalPoints,
    percent,
    logs: userLogs
  };
}
