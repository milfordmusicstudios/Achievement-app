// Must be included AFTER config.js is loaded
// Example usage:
fetch(`${BASE_API}/users`)

// img.src = `${BASE_UPLOAD}${user.avatarUrl}`;//

// ✅ Load teacher options when the page loads
window.addEventListener("DOMContentLoaded", async () => {
  const teacherSelect = document.getElementById("teacher");

  try {
const { data: users, error } = await supabase
  .from("users")
  .select("*");

if (error) throw error;

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
  id: `${lastName}_${firstName}`,
  firstName,
  lastName,
  email,
  password,
  instrument: instrument || "",
  avatar: `${lastName}_${firstName}`,
  avatarUrl: `/uploads/${lastName}_${firstName}.png`,

  // ✅ Fixed: hard-coded default role
  roles: ["student"],

  // ✅ Already correct
  teacher: typeof teacher === "string" ? teacher : "",

  createdAt: new Date().toISOString()
};

try {
  const { data, error } = await supabase
    .from("users")
    .insert([newUser]);

  if (error) {
    console.error("Signup failed:", error.message);
    showError("Signup failed: " + error.message);
    return;
  }

  const createdUser = data[0]; // renamed to avoid shadowing
  localStorage.setItem("loggedInUser", JSON.stringify(createdUser));

  const activeRole = Array.isArray(createdUser.role || createdUser.roles)
    ? (createdUser.role || createdUser.roles)[0]
    : (createdUser.role || createdUser.roles || "student");

  localStorage.setItem("activeRole", activeRole);
  window.location.href = "home.html";

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
