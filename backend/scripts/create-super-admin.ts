import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const email =
    process.env.BACKOFFICE_ADMIN_EMAIL?.trim() || 'admin@myridepartner.com';
  const password =
    process.env.BACKOFFICE_ADMIN_PASSWORD?.trim() || 'AdminPassword123!';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const query = `
    INSERT INTO "User" (email, username, password, role, confirmed, "updatedAt") 
    VALUES ($1, $2, $3, 'SUPER_ADMIN', true, NOW())
    ON CONFLICT (email) DO UPDATE 
    SET password = $3, role = 'SUPER_ADMIN', confirmed = true, "updatedAt" = NOW()
    RETURNING id, email, username, role;
  `;
  
  const result = await pool.query(query, [email, 'superadmin', hashedPassword]);
  console.log('Created Super Admin:', result.rows[0]);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

main().catch(console.error).finally(() => pool.end());
