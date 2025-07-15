// Must be included AFTER config.js is loaded
// Example usage:
fetch(`${BASE_API}/users`)

// img.src = `${BASE_UPLOAD}${user.avatarUrl}`;//

// ✅ Load teacher options when the page loads
window.addEventListener("DOMContentLoaded", async () => {
  const teacherSelect = document.getElementById("teacher");

  try {
    const res = await fetch(`${BASE_API}/users`);
    const users = await res.json();

const teacherUsers = users.filter(user => {
const roles = Array.isArray(user.roles)
  ? user.roles
  : typeof user.roles === "string"
    ? [user.roles]
    : [];

  return roles.includes("teacher");
});

    if (teacherUsers.length === 0) {
      const option = document.createElement("option");
      option.textContent = "No teachers found";
      option.disabled = true;
      teacherSelect.appendChild(option);
    } else {
teacherUsers
  .sort((a, b) => {
    const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
    const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
    return nameA.localeCompare(nameB);
  })
  .forEach(t => {
    const option = document.createElement("option");
    option.value = t.id;
    option.textContent = `${t.firstName} ${t.lastName}`;
    teacherSelect.appendChild(option);
  });
    }

  } catch (err) {
    console.error("Error loading teachers:", err);
    const option = document.createElement("option");
    option.disabled = true;
    option.textContent = "Error loading teachers";
    teacherSelect.appendChild(option);
  }
});

// ✅ Handle form submission
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const instrument = document.getElementById('instrument').value.trim();
  const teacher = document.getElementById('teacher').value.trim();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;

  if (!firstName || !lastName || !instrument || !teacher || !email || !password) {
    showError("Please fill out all fields.");
    return;
  }

  const id = `${lastName}_${firstName}`.replace(/\s+/g, "_");

  const newUser = {
    firstName,
    lastName,
    instrument,
    teacher,
    email,
    password,
    id,
    roles: ["student"]
  };

  try {
const res = await fetch(`${BASE_API}/users`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(newUser)
    });

if (res.ok) {
  const newUser = await res.json();

  // Set localStorage just like login does
  localStorage.setItem("loggedInUser", JSON.stringify(newUser));

  // Determine active role (default to first one if it's an array)
  const activeRole = Array.isArray(newUser.role || newUser.roles)
    ? (newUser.role || newUser.roles)[0]
    : (newUser.role || newUser.roles || "student");

  localStorage.setItem("activeRole", activeRole);

  // Redirect to home page
  window.location.href = "home.html";
    } else {
      const error = await res.text();
      showError("Signup failed: " + error);
    }
  } catch (err) {
    console.error("Signup error:", err);
    showError("Something went wrong. Please try again.");
  }
});

function showError(message) {
  const errorDisplay = document.getElementById("signupError");
  errorDisplay.textContent = message;
  errorDisplay.style.display = "block";
}
