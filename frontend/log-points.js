import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { getCurrentUser, getActiveRole } from './auth.js';

const supabase = createClient(
  'https://tpcjdgucyrqrzuqvshki.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwY2pkZ3VjeXJxcnp1cXZzaGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MDE5OTksImV4cCI6MjA2ODI3Nzk5OX0.XGHcwyeTzYje6cjd3PHQrr7CyyEcaoRB4GyTYN1fDqo'
);

const categories = [
  { name: "Practice", image: "images/categories/practice.png" },
  { name: "Participation", image: "images/categories/participation.png" },
  { name: "Performance", image: "images/categories/performance.png" },
  { name: "Improvement", image: "images/categories/improvement.png" },
  { name: "Teamwork", image: "images/categories/teamwork.png" },
];

document.addEventListener("DOMContentLoaded", async () => {
  const user = getCurrentUser();
  const role = getActiveRole();

  if (!user) return (window.location.href = "index.html");

  const studentSelector = document.getElementById("logStudent");
  const logForm = document.getElementById("logForm");
  const studentRow = document.getElementById("studentSelectGroup");
  const categorySelect = document.getElementById("logCategory");
  const categoryPreview = document.getElementById("categoryPreview");

  // Load category dropdown and preview
  if (categorySelect) {
    categories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat.name;
      option.textContent = cat.name;
      categorySelect.appendChild(option);
    });

    categorySelect.addEventListener("change", () => {
      const selected = categories.find(c => c.name === categorySelect.value);
      if (selected && categoryPreview) {
        categoryPreview.src = selected.image;
      }
    });
  }

  // Show student selector for admin/teacher
  if (["admin", "teacher"].includes(role)) {
    studentRow.style.display = "flex";
    const { data: users, error } = await supabase.from("users").select("*");
    if (error) {
      console.error("Error loading users:", error);
      alert("Unable to load student list.");
      return;
    }

    const filtered = users.filter(u => {
      const r = Array.isArray(u.roles) ? u.roles : [u.roles];
      const isStudent = r.includes("student");
      const teaches = Array.isArray(u.teacher) ? u.teacher.includes(user.id) : u.teacher === user.id;
      return isStudent && (role === "admin" || teaches);
    });

    filtered.sort((a, b) => a.lastName.localeCompare(b.lastName));
    for (const s of filtered) {
      const option = document.createElement("option");
      option.value = s.id;
      option.textContent = `${s.firstName} ${s.lastName}`;
      studentSelector.appendChild(option);
    }
  }

  logForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const selectedStudent = studentSelector?.value || user.id;
    const selectedCategory = categorySelect?.value;
    const points = parseInt(document.getElementById("logPoints").value);
    const note = document.getElementById("logNotes")?.value || "";
    const date = document.getElementById("logDate").value || new Date().toISOString().split("T")[0];

    if (!selectedCategory || isNaN(points)) {
      alert("Please fill out all fields.");
      return;
    }

    const log = {
      user: selectedStudent,
      category: selectedCategory,
      date,
      points,
      note,
      status: "Pending"
    };

    const { error } = await supabase.from("logs").insert([log]);
    if (error) {
      console.error("Error logging points:", error.message);
      alert("Failed to log points.");
    } else {
      alert("Points logged successfully!");
      logForm.reset();
      if (categoryPreview) categoryPreview.src = "images/categories/allcategories.png";
    }
  });
});