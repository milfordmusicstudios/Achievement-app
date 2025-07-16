// Must be included AFTER config.js is loaded
// Example usage:
fetch(`${BASE_API}/users`)
//img.src = `${BASE_UPLOAD}${user.avatarUrl}`;


document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
      const res = await fetch(`${BASE_API}/users`);
      const allUsers = await res.json();

      const matchingUsers = allUsers.filter(
        u => u.email === email && u.password === password
      );

      if (matchingUsers.length === 0) {
        alert("Invalid email or password.");
        return;
      }

      let selectedUser = matchingUsers[0];

      if (matchingUsers.length > 1) {
        const names = matchingUsers.map(u => `${u.firstName} ${u.lastName}`);
        const nameChoice = prompt(`Multiple users share this email. Who are you?\n${names.join('\n')}`);
        selectedUser = matchingUsers.find(u => `${u.firstName} ${u.lastName}` === nameChoice.trim());
        if (!selectedUser) {
          alert("Login cancelled.");
          return;
        }
      }

      // Set default active role if multiple
      const active = Array.isArray(selectedUser.role)
        ? selectedUser.role[0]
        : selectedUser.role;

      localStorage.setItem("loggedInUser", JSON.stringify(selectedUser));
      localStorage.setItem("activeRole", active);

      window.location.href = "home.html";

    } catch (err) {
      console.error("Login failed:", err);
      alert("Login error. Try again later.");
    }
  });
});

// Logout function
function handleLogout() {
  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("activeRole");
  window.location.href = "login.html";
}
