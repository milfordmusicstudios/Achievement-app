import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://tpcjdgucyrqrzuqvshki.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwY2pkZ3VjeXJxcnp1cXZzaGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MDE5OTksImV4cCI6MjA2ODI3Nzk5OX0.XGHcwyeTzYje6cjd3PHQrr7CyyEcaoRB4GyTYN1fDqo'
);

// Load teachers into dropdown
window.addEventListener("DOMContentLoaded", async () => {
  const teacherSelect = document.getElementById("teacher");

  try {
    const { data: users, error } = await supabase.from("users").select("*");
    if (error) throw error;

    const teachers = users.filter(u =>
      Array.isArray(u.roles) ? u.roles.includes("teacher") : false
    );

    teachers.sort((a, b) =>
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
    ).forEach(t => {
      const option = document.createElement("option");
      option.value = t.id;
      option.textContent = `${t.firstName} ${t.lastName}`;
      teacherSelect.appendChild(option);
    });

  } catch (err) {
    console.error("Failed to load teachers", err);
    const option = document.createElement("option");
    option.textContent = "Error loading teachers";
    option.disabled = true;
    teacherSelect.appendChild(option);
  }
});

// Handle sign-up
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const instrument = document.getElementById('instrument').value.trim();
  const teacher = document.getElementById('teacher').value.trim();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;

  if (!firstName || !lastName || !instrument || !teacher || !email || !password) {
    return showError("Please fill out all fields.");
  }

  // ✅ 1. Create Supabase auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password
  });

  if (authError || !authData?.user) {
    console.error("Auth signup failed:", authError?.message);
    return showError("Signup failed: " + (authError?.message || "Unknown error."));
  }

  const userId = authData.user.id;

  // ✅ 2. Create profile in "users" table (excluding password)
  const newUserProfile = {
    id: userId,
    firstName,
    lastName,
    email,
    roles: ["student"],
    teacher,
    instrument,
    avatar: "", // you can generate a default here if needed
    createdAt: new Date().toISOString()
  };

  const { data: profileData, error: profileError } = await supabase
    .from("users")
    .insert([newUserProfile]);

  if (profileError) {
    console.error("Failed to save profile:", profileError);
    return showError("Signup failed: could not save profile.");
  }

  // ✅ 3. Store and redirect
  localStorage.setItem("loggedInUser", JSON.stringify(newUserProfile));
  localStorage.setItem("activeRole", "student");

  window.location.href = "home.html";
});

function showError(message) {
  const errorDisplay = document.getElementById("signupError");
  errorDisplay.textContent = message;
  errorDisplay.style.display = "block";
}
