// log-points.js

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
    // Load users and logs from Supabase
    const [{ data: usersData, error: userError }, { data: logsData, error: logsError }] = await Promise.all([
      supabase.from("users").select("*"),
      supabase.from("logs").select("*")
    ]);

    if (userError || logsError) throw userError || logsError;

    users = usersData;
    logs = logsData;

    if (!user) return;

    const studentSelector = document.getElementById("logStudent");
    const logForm = document.getElementById("logForm");
    const studentRow = document.getElementById("studentSelectGroup");

    const categorySelect = document.getElementById("logCategory");

    // Populate category dropdown
    if (categorySelect && categorySelect.children.length <= 1) {
      categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
      });
    }

    // Show student selector for admin/teacher
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

    // Handle form submission
    logForm.addEventListener("submit", async e => {
      e.preventDefault();
      const formData = new FormData(logForm);

      const log = {
        user: activeRole === "student" ? user.id : formData.get("student"),
        date: new Date().toISOString().split("T")[0],
        category: formData.get("category"),
        points: parseInt(formData.get("points")),
        note: formData.get("note") || "",
        status: "pending"
      };

      try {
        const { error } = await supabase.from("logs").insert([log]);
        if (error) throw error;

        alert("Points logged!");
        logForm.reset();
        if (studentSelector) studentSelector.selectedIndex = 0;
      } catch (err) {
        console.error("Error submitting log:", err);
        alert("Failed to submit log.");
      }
    });

  } catch (err) {
    console.error("Error loading page:", err);
    alert("Failed to load data.");
  }
});
