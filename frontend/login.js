// login.js
// Must be included AFTER config.js is loaded

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById('loginForm');
  const errorDisplay = document.getElementById('loginError');

  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail')?.value.trim().toLowerCase();
    const password = document.getElementById('loginPassword')?.value;

    if (!email || !password) {
      errorDisplay.style.display = 'block';
      errorDisplay.textContent = 'Please enter both email and password.';
      return;
    }

    try {
      const { data: users, error } = await supabase.from("users").select("*");

      if (error) throw error;

      const user = users.find(u =>
        u.email?.toLowerCase() === email &&
        u.password === password
      );

      if (user) {
        localStorage.setItem("loggedInUser", JSON.stringify(user));

        // ✅ Determine default role from roles or role field
        let rawRoles = user.roles || user.role || [];
        let roleList = Array.isArray(rawRoles) ? rawRoles : [rawRoles];
        roleList = roleList.map(r => r.toLowerCase());

        let defaultRole = "student";
        if (roleList.includes("admin")) {
          defaultRole = "admin";
        } else if (roleList.includes("teacher")) {
          defaultRole = "teacher";
        }

        localStorage.setItem("activeRole", defaultRole);
        window.location.href = 'home.html';
      } else {
        errorDisplay.style.display = 'block';
        errorDisplay.textContent = 'Invalid email or password.';
      }

    } catch (err) {
      console.error("Login error:", err);
      errorDisplay.style.display = 'block';
      errorDisplay.textContent = 'Server error. Please try again.';
    }
  });
});
