require('dotenv').config(); // <-- Added this to load your .env file
const { execSync } = require("child_process")
const path = require("path")
const fs = require("fs")

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is not set")
  console.error("Ensure you have a .env file in the root directory with DATABASE_URL defined.")
  process.exit(1)
}

const migrationsDir = path.join(__dirname, "..", "migrations")

// Ensure migrations directory exists
if (!fs.existsSync(migrationsDir)) {
  console.error(`ERROR: Migrations directory not found at ${migrationsDir}`)
  process.exit(1)
}

const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql")).sort()

if (files.length === 0) {
  console.log("No migration files found.")
  process.exit(0)
}

console.log("Running migrations...")
for (const file of files) {
  const filepath = path.join(migrationsDir, file)
  console.log("  -> " + file)
  
  try {
    // We wrap DATABASE_URL in quotes for Windows shell compatibility
    execSync(`psql "${DATABASE_URL}" -f "${filepath}"`, { stdio: "inherit" })
  } catch (err) {
    console.error(`Failed to execute migration: ${file}`)
    process.exit(1)
  }
}
console.log("Done!")