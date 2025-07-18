
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById('loginForm');
  const errorDisplay = document.getElementById('loginError');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!email || !password) {
      errorDisplay.style.display = 'block';
      errorDisplay.textContent = 'Please enter both email and password.';
      return;
    }

    try {
      const { data: users, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email);

      if (error) throw error;

      const user = users.find(u => u.password === password);
      console.log("User:", user);

      if (user) {
        // Set roles properly
        const roles = Array.isArray(user.roles) ? user.roles : [];
        const active = roles.length > 0 ? roles[0] : "student";
        console.log("Active Role:", active);

        localStorage.setItem("loggedInUser", JSON.stringify(user));
        localStorage.setItem("activeRole", active);
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
