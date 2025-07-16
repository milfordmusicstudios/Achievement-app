
// LOG POINTS JS

let users = [];
let logs = [];

const user = JSON.parse(localStorage.getItem("loggedInUser"));
const activeRole = localStorage.getItem("activeRole") || "student";

const categories = [
  "Practice",
  "Participation",
  "Performance",
  "Improvement",
  "Teamwork"
];

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const userRes = await fetch(`${BASE_API}/users`);
    users = await userRes.json();

    const logsRes = await fetch(`${BASE_API}/logs`);
    logs = await logsRes.json();

    if (!user) return;
    const studentSelector = document.getElementById("logStudent");
    const logForm = document.getElementById("logForm");
    const studentRow = document.getElementById("studentSelectGroup");

    const categorySelect = document.getElementById("logCategory");
    console.log("Category select found:", categorySelect);
    console.log("Categories to add:", categories);

    if (categorySelect && categorySelect.children.length <= 1) {
      categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
      });
    }

    if (activeRole === "admin" || activeRole === "teacher") {
      const filtered = users.filter(u => {
        if (!u.role && !u.roles) return false;
        const roleList = Array.isArray(u.roles || u.role) ? u.roles || u.role : [u.roles || u.role];
        const isStudent = roleList.includes("student");
        const teaches = Array.isArray(u.teacher)
          ? u.teacher.includes(user.id)
          : u.teacher === user.id;
        return isStudent && (activeRole === "admin" || teaches);
      });

      filtered.sort((a, b) => a.lastName.localeCompare(b.lastName));

      filtered.forEach(s => {
        const option = document.createElement("option");
        option.value = s.id;
        option.textContent = `${s.firstName} ${s.lastName}`;
        studentSelector.appendChild(option);
      });

      studentRow.style.display = "table-row";
    } else {
      studentRow.style.display = "none";
    }

    logForm.addEventListener("submit", async e => {
      e.preventDefault();
      const formData = new FormData(logForm);

      const log = {
        user: activeRole === "student" ? user.id : formData.get("student"),
        date: new Date().toISOString().split("T")[0],
        category: formData.get("category"),
        points: parseInt(formData.get("points")),
        note: formData.get("note") || ""
      };

      await fetch(`${BASE_API}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(log)
      });

      alert("Points logged!");
      logForm.reset();
      if (studentSelector) studentSelector.selectedIndex = 0;
    });

  } catch (err) {
    console.error("Error loading page:", err);
    alert("Failed to load data.");
  }
});
