import fs from 'node:fs';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import bcrypt from 'bcryptjs';

let dbInstance: PGlite | null = null;
let initPromise: Promise<PGlite> | null = null;

const DATA_DIR = path.resolve(process.cwd(), 'data', 'postgres');

export async function getDb(): Promise<PGlite> {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const db = new PGlite(DATA_DIR);
    await initSchemaAndSeed(db);
    dbInstance = db;
    return db;
  })();

  return initPromise;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = await getDb();
  const result = await db.query(sql, params);
  return (result.rows || []) as T[];
}

export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

async function initSchemaAndSeed(db: PGlite) {
  // 1. Colleges
  await db.exec(`
    CREATE TABLE IF NOT EXISTS colleges (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      domain TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // 2. Task categories
  await db.exec(`
    CREATE TABLE IF NOT EXISTS task_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      icon TEXT,
      base_suggested_fee NUMERIC NOT NULL DEFAULT 50,
      is_active BOOLEAN NOT NULL DEFAULT true
    );
  `);

  // 3. Users
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      phone TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      account_status TEXT NOT NULL DEFAULT 'active',
      email_verified BOOLEAN NOT NULL DEFAULT false,
      phone_verified BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
  `);

  // 4. Profiles
  await db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      avatar_url TEXT,
      bio TEXT,
      college_id TEXT REFERENCES colleges(id) ON DELETE SET NULL,
      department TEXT,
      year_of_study TEXT,
      skills JSONB NOT NULL DEFAULT '[]'::jsonb,
      is_available BOOLEAN NOT NULL DEFAULT true,
      preferred_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
      max_purchase_limit NUMERIC NOT NULL DEFAULT 500,
      rating_avg NUMERIC NOT NULL DEFAULT 5.0,
      tasks_completed INTEGER NOT NULL DEFAULT 0,
      tasks_posted INTEGER NOT NULL DEFAULT 0,
      approx_lat NUMERIC,
      approx_lng NUMERIC,
      approx_address TEXT,
      verification_status TEXT NOT NULL DEFAULT 'PENDING',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_profiles_available ON profiles(is_available);
    CREATE INDEX IF NOT EXISTS idx_profiles_college ON profiles(college_id);
    CREATE INDEX IF NOT EXISTS idx_profiles_verification ON profiles(verification_status);
  `);

  // 5. College Verifications
  await db.exec(`
    CREATE TABLE IF NOT EXISTS college_verifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      college_id TEXT REFERENCES colleges(id) ON DELETE SET NULL,
      id_card_url TEXT,
      id_number TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      reviewed_by TEXT REFERENCES users(id),
      reviewer_notes TEXT,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      reviewed_at TIMESTAMPTZ
    );
    CREATE INDEX IF NOT EXISTS idx_verifications_status ON college_verifications(status);
    CREATE INDEX IF NOT EXISTS idx_verifications_user ON college_verifications(user_id);
  `);

  // 6. Tasks (State-Machine schema ready for Phase 2)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      creator_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category_id TEXT NOT NULL REFERENCES task_categories(id),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      worker_fee NUMERIC NOT NULL,
      estimated_purchase_cost NUMERIC NOT NULL DEFAULT 0,
      total_budget NUMERIC NOT NULL,
      status TEXT NOT NULL DEFAULT 'POSTED',
      is_urgent BOOLEAN NOT NULL DEFAULT false,
      approx_lat NUMERIC,
      approx_lng NUMERIC,
      approx_area TEXT,
      preferred_time TEXT,
      estimated_duration_min INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_creator ON tasks(creator_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
  `);

  // 7. Audit logs & Analytics
  await db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      event_name TEXT NOT NULL,
      user_id TEXT,
      properties JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Seed default colleges if empty
  const collegeCount = await db.query<{ count: string | number }>(`SELECT COUNT(*) as count FROM colleges`);
  if (Number(collegeCount.rows[0]?.count || 0) === 0) {
    const colleges = [
      { id: 'col_srm_ktr', name: 'SRM Institute of Science & Technology (KTR)', code: 'SRM-KTR', domain: 'srmist.edu.in', city: 'Kattankulathur', state: 'Tamil Nadu' },
      { id: 'col_srm_rmp', name: 'SRM University (Ramapuram Campus)', code: 'SRM-RMP', domain: 'srmist.edu.in', city: 'Chennai', state: 'Tamil Nadu' },
      { id: 'col_srm_vdp', name: 'SRM University (Vadapalani Campus)', code: 'SRM-VDP', domain: 'srmist.edu.in', city: 'Chennai', state: 'Tamil Nadu' },
      { id: 'col_vit_chn', name: 'VIT Chennai Campus', code: 'VIT-CHN', domain: 'vit.ac.in', city: 'Vandalur-Kelambakkam', state: 'Tamil Nadu' },
      { id: 'col_iit_mds', name: 'IIT Madras', code: 'IIT-M', domain: 'iitm.ac.in', city: 'Chennai', state: 'Tamil Nadu' },
      { id: 'col_general_comm', name: 'General Local Community (Open Public)', code: 'COMMUNITY', domain: '', city: 'Greater Chennai & Beyond', state: 'Tamil Nadu' }
    ];
    for (const c of colleges) {
      await db.query(
        `INSERT INTO colleges (id, name, code, domain, city, state, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [c.id, c.name, c.code, c.domain, c.city, c.state, true]
      );
    }
  }

  // Seed default categories if empty
  const catCount = await db.query<{ count: string | number }>(`SELECT COUNT(*) as count FROM task_categories`);
  if (Number(catCount.rows[0]?.count || 0) === 0) {
    const categories = [
      { id: 'cat_food', name: 'Food Pickup', slug: 'food-pickup', description: 'Deliver food orders from campus canteens or local restaurants', icon: 'Utensils', fee: 50 },
      { id: 'cat_parcel', name: 'Pickup / Delivery', slug: 'pickup-delivery', description: 'Parcel pickup, post office drop, courier hand-offs', icon: 'Package', fee: 60 },
      { id: 'cat_shopping', name: 'Shopping / Errands', slug: 'shopping-errands', description: 'Pharmacy, grocery, stationer, or local store purchases', icon: 'ShoppingBag', fee: 70 },
      { id: 'cat_moving', name: 'Moving / Helping', slug: 'moving-helping', description: 'Hostel room shifts, carrying heavy baggage, event load-in', icon: 'Truck', fee: 150 },
      { id: 'cat_printing', name: 'Printing / Academic Support', slug: 'printing-academic', description: 'Printouts, spiral binding, lab manual photocopies, notes pickup', icon: 'FileText', fee: 40 },
      { id: 'cat_tech', name: 'Technical Help', slug: 'technical-help', description: 'OS installation, software debugging, WiFi setup, electronics troubleshooting', icon: 'Cpu', fee: 200 },
      { id: 'cat_event', name: 'Event Help', slug: 'event-help', description: 'College fest setup, registration desk, photography, ushering', icon: 'Calendar', fee: 120 },
      { id: 'cat_cleaning', name: 'Cleaning / Organization', slug: 'cleaning-organization', description: 'Hostel room decluttering, wardrobe sorting, lab cleanup', icon: 'Sparkles', fee: 100 },
      { id: 'cat_other', name: 'Other Micro-Tasks', slug: 'other', description: 'Any other legitimate custom local errand or micro-task', icon: 'CheckCircle', fee: 50 }
    ];
    for (const cat of categories) {
      await db.query(
        `INSERT INTO task_categories (id, name, slug, description, icon, base_suggested_fee, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [cat.id, cat.name, cat.slug, cat.description, cat.icon, cat.fee, true]
      );
    }
  }

  // Seed default admin and sample users if empty
  const userCount = await db.query<{ count: string | number }>(`SELECT COUNT(*) as count FROM users`);
  if (Number(userCount.rows[0]?.count || 0) === 0) {
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('Admin@123456', salt);
    const demoPasswordHash = await bcrypt.hash('Demo@123456', salt);

    // 1. Admin
    await db.query(
      `INSERT INTO users (id, email, phone, password_hash, name, role, account_status, email_verified, phone_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      ['usr_admin', 'admin@taskhop.local', '+919876543210', adminPasswordHash, 'TaskHop Admin', 'admin', 'active', true, true]
    );
    await db.query(
      `INSERT INTO profiles (user_id, avatar_url, bio, college_id, department, year_of_study, skills, is_available, verification_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9)`,
      ['usr_admin', '', 'Platform Administrator & Trust Moderator', 'col_srm_ktr', 'Operations', 'Staff', JSON.stringify(['Moderation', 'Audit', 'Dispatch']), false, 'VERIFIED']
    );

    // 2. Demo Student Worker/Customer: Aravind
    await db.query(
      `INSERT INTO users (id, email, phone, password_hash, name, role, account_status, email_verified, phone_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      ['usr_aravind', 'aravind@srm.edu', '+919812345678', demoPasswordHash, 'Aravind Swaminathan', 'user', 'active', true, true]
    );
    await db.query(
      `INSERT INTO profiles (user_id, avatar_url, bio, college_id, department, year_of_study, skills, is_available, preferred_categories, max_purchase_limit, rating_avg, tasks_completed, tasks_posted, approx_address, verification_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9::jsonb, $10, $11, $12, $13, $14, $15)`,
      [
        'usr_aravind',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        '3rd year CSE student at SRM KTR. Available for food deliveries from Potheri, quick printing, and tech troubleshooting.',
        'col_srm_ktr',
        'Computer Science & Engineering',
        '3rd Year',
        JSON.stringify(['Food Pickup', 'Fast Cycle Delivery', 'Linux & Code Support', 'Printing']),
        true,
        JSON.stringify(['cat_food', 'cat_printing', 'cat_tech']),
        800,
        4.9,
        28,
        5,
        'Java Hostel / Main Gate, SRM KTR',
        'VERIFIED'
      ]
    );

    // 3. Demo Student Customer/Worker: Priya
    await db.query(
      `INSERT INTO users (id, email, phone, password_hash, name, role, account_status, email_verified, phone_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      ['usr_priya', 'priya.k@srm.edu', '+919876501234', demoPasswordHash, 'Priya Krishnan', 'user', 'active', true, false]
    );
    await db.query(
      `INSERT INTO profiles (user_id, avatar_url, bio, college_id, department, year_of_study, skills, is_available, preferred_categories, max_purchase_limit, rating_avg, tasks_completed, tasks_posted, approx_address, verification_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9::jsonb, $10, $11, $12, $13, $14, $15)`,
      [
        'usr_priya',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
        'Biotech major. Frequently need urgent pharmacy items or assignment printing from Tech Park.',
        'col_srm_ktr',
        'Biotechnology',
        '2nd Year',
        JSON.stringify(['Event Coordination', 'Hostel Moving', 'Shopping']),
        false,
        JSON.stringify(['cat_parcel', 'cat_shopping']),
        500,
        4.8,
        8,
        14,
        'Senbagam Hostel, SRM KTR',
        'VERIFIED'
      ]
    );

    // 4. Sample Verification Record for review preview in Admin
    await db.query(
      `INSERT INTO college_verifications (id, user_id, college_id, id_card_url, id_number, status, submitted_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        'ver_demo_pending',
        'usr_priya',
        'col_srm_ktr',
        'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=400&q=80',
        'RA2211003010452',
        'VERIFIED',
        new Date().toISOString()
      ]
    );
  }
}
