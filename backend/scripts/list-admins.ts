import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const query = `
    SELECT email, username FROM "User" WHERE role = 'SUPER_ADMIN';
  `;
  const result = await pool.query(query);
  console.log(JSON.stringify(result.rows, null, 2));
}

main()
  .catch(console.error)
  .finally(() => pool.end());


