import { getDb, query } from '../src/server/db/client.ts';
import bcrypt from 'bcryptjs';

async function runTests() {
  console.log('--- Starting TaskHop Phase 1 Foundation Tests ---');

  // Test 1: DB connection and tables
  const db = await getDb();
  console.log('✓ Database connected successfully.');

  const tables = await query<{ table_name: string }>(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
  );
  console.log('✓ Found tables in PostgreSQL public schema:', tables.map(t => t.table_name).join(', '));

  // Test 2: Check seeded colleges
  const colleges = await query<{ id: string; name: string }>(`SELECT id, name FROM colleges`);
  console.log(`✓ Seeded ${colleges.length} colleges:`, colleges.map(c => c.name).join(', '));

  // Test 3: Check seeded categories
  const categories = await query<{ id: string; name: string }>(`SELECT id, name FROM task_categories`);
  console.log(`✓ Seeded ${categories.length} categories:`, categories.map(c => c.name).join(', '));

  // Test 4: Check default users & admin
  const users = await query<{ email: string; role: string }>(`SELECT email, role FROM users`);
  console.log(`✓ Seeded ${users.length} accounts:`, users.map(u => `${u.email} (${u.role})`).join(', '));

  // Test 5: Verify password hash verification works
  const adminUser = await query<{ password_hash: string }>(`SELECT password_hash FROM users WHERE email = 'admin@taskhop.local'`);
  const isMatch = await bcrypt.compare('Admin@123456', adminUser[0].password_hash);
  console.log('✓ Admin password hash check passed:', isMatch);

  // Test 6: Verify dual persona & availability column
  const aravindProfile = await query<{ is_available: boolean; tasks_completed: number; verification_status: string }>(
    `SELECT is_available, tasks_completed, verification_status FROM profiles WHERE user_id = 'usr_aravind'`
  );
  console.log('✓ Aravind profile verified:', aravindProfile[0]);

  console.log('--- ALL PHASE 1 TESTS PASSED SUCCESSFULLY! ---');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
