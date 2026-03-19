import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const result = await pool.query("SELECT id, email, username, role FROM \"User\" WHERE role = 'SUPER_ADMIN'");
  console.log('SUPER_ADMINS:', result.rows);
}

main().catch(console.error).finally(() => pool.end());
