const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://tpcjdgucyrqrzuqvshki.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwY2pkZ3VjeXJxcnp1cXZzaGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MDE5OTksImV4cCI6MjA2ODI3Nzk5OX0.XGHcwyeTzYje6cjd3PHQrr7CyyEcaoRB4GyTYN1fDqo"
);

(async () => {
  const { data, error } = await supabase.from("users").select("*");

  console.log("DATA:", data);
  console.log("ERROR:", error);
})();
