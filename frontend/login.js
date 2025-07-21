import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://tpcjdgucyrqrzuqvshki.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById('loginForm');
  const errorDisplay = document.getElementById('loginError');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      errorDisplay.textContent = "Please enter both email and password.";
      errorDisplay.style.display = "block";
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData?.user) {
      errorDisplay.textContent = "Invalid email or password.";
      errorDisplay.style.display = "block";
      return;
    }

    const { data: userRecord, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (fetchError || !userRecord) {
      errorDisplay.textContent = "Login succeeded, but user profile not found.";
      errorDisplay.style.display = "block";
      return;
    }
document.getElementById("forgotPasswordLink").addEventListener("click", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const errorDisplay = document.getElementById("loginError");

  if (!email) {
    errorDisplay.textContent = "Please enter your email address first.";
    errorDisplay.style.display = "block";
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "https://achievement-app-nine.vercel.app/reset-password.html"
  });

  if (error) {
    errorDisplay.textContent = "Error sending reset email: " + error.message;
  } else {
    errorDisplay.style.color = "green";
    errorDisplay.textContent = "Password reset email sent!";
  }
});

    const roles = Array.isArray(userRecord.roles) ? userRecord.roles : [];
    const activeRole = roles.length > 0 ? roles[0] : "student";

    localStorage.setItem("loggedInUser", JSON.stringify(userRecord));
    localStorage.setItem("activeRole", activeRole);

    window.location.href = "home.html";
  });
});
