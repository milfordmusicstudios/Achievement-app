// auth.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://tpcjdgucyrqrzuqvshki.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwY2pkZ3VjeXJxcnp1cXZzaGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MDE5OTksImV4cCI6MjA2ODI3Nzk5OX0.XGHcwyeTzYje6cjd3PHQrr7CyyEcaoRB4GyTYN1fDqo'
);

// Get current logged-in user
export function getCurrentUser() {
  try {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!user || !user.id) return null;

    user.roles = Array.isArray(user.roles) ? user.roles : [user.roles];
    return user;
  } catch (err) {
    return null;
  }
}

// Get the currently selected role (if user has multiple)
export function getActiveRole() {
  return localStorage.getItem("activeRole") || "student";
}

// Log out user
export function logout() {
  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("activeRole");
  window.location.href = "index.html";
}
