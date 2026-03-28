import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const supabase = createClient(
  "https://scmcmdcglkwssntaipgv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjbWNtZGNnbGt3c3NudGFpcGd2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY5MzUwMiwiZXhwIjoyMDkwMjY5NTAyfQ.DevysP2b7jwucrcegt0BUM-4E1WiPKjsuxDuSLQmF18"
);

const sql = readFileSync(new URL("./migration.sql", import.meta.url), "utf-8");

// Split into individual statements
const statements = sql
  .split(";")
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith("--"));

let success = 0;
let failed = 0;

for (const stmt of statements) {
  const { error } = await supabase.rpc("exec_sql", { query: stmt + ";" }).single();
  if (error) {
    // Try via postgrest schema - some statements may not work via rpc
    console.log(`⚠ Statement needs SQL editor: ${stmt.slice(0, 60)}...`);
    failed++;
  } else {
    success++;
  }
}

console.log(`\n✅ ${success} succeeded, ⚠ ${failed} need manual execution`);
console.log("\nIf any failed, paste the contents of migration.sql into:");
console.log("Supabase Dashboard > SQL Editor > New Query > Run");
