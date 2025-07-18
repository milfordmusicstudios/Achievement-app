document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const errorDisplay = document.getElementById("loginError");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!email || !password) {
      errorDisplay.style.display = "block";
      errorDisplay.textContent = "Please enter both email and password.";
      return;
    }

    try {
      const response = await fetch("https://tpcjdgucyrqrzuqvshki.supabase.co/rest/v1/users?select=*", {
        headers: {
          apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwY2pkZ3VjeXJxcnp1cXZzaGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MDE5OTksImV4cCI6MjA2ODI3Nzk5OX0.XGHcwyeTzYje6cjd3PHQrr7CyyEcaoRB4GyTYN1fDqo",
          Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwY2pkZ3VjeXJxcnp1cXZzaGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MDE5OTksImV4cCI6MjA2ODI3Nzk5OX0.XGHcwyeTzYje6cjd3PHQrr7CyyEcaoRB4GyTYN1fDqo"
        }
      });

      const users = await response.json();
      const user = users.find(
        u => u.email?.toLowerCase() === email && u.password === password
      );

      if (user) {
        // Normalize roles
        const rawRoles = user.roles || user.role || [];
        const roleList = Array.isArray(rawRoles) ? rawRoles : [rawRoles];
        const normalizedRoles = roleList.map(r => r.toLowerCase());

        // Normalize avatar field
        if (user.avatar && !user.avatarUrl) {
          user.avatarUrl = user.avatar;
        }

        // Attach normalized role
        user.role = normalizedRoles;

        // Save to localStorage
        localStorage.setItem("loggedInUser", JSON.stringify(user));

        // Set active role
        const defaultRole = normalizedRoles.includes("admin")
          ? "admin"
          : normalizedRoles.includes("teacher")
          ? "teacher"
          : "student";

        localStorage.setItem("activeRole", defaultRole);
        window.location.href = "home.html";
      } else {
        errorDisplay.style.display = "block";
        errorDisplay.textContent = "Invalid email or password.";
      }
    } catch (err) {
      console.error("Login error:", err);
      errorDisplay.style.display = "block";
      errorDisplay.textContent = "Server error. Please try again.";
    }
  });
});