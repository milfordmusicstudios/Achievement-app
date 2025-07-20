import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://tpcjdgucyrqrzuqvshki.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwY2pkZ3VjeXJxcnp1cXZzaGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MDE5OTksImV4cCI6MjA2ODI3Nzk5OX0.XGHcwyeTzYje6cjd3PHQrr7CyyEcaoRB4GyTYN1fDqo'
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

    // ✅ Supabase Auth sign-in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData?.user) {
      errorDisplay.textContent = "Invalid email or password.";
      errorDisplay.style.display = "block";
      return;
    }

    // ✅ Fetch additional user metadata from "users" table
    const { data: userRecord, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (fetchError || !userRecord) {
      errorDisplay.textContent = "Login successful, but user data not found.";
      errorDisplay.style.display = "block";
      return;
    }

    // ✅ Store role and user info in localStorage
    const roles = Array.isArray(userRecord.roles) ? userRecord.roles : [];
    const activeRole = roles.length > 0 ? roles[0] : "student";

    localStorage.setItem("loggedInUser", JSON.stringify(userRecord));
    localStorage.setItem("activeRole", activeRole);

    window.location.href = "home.html";
  });
});
