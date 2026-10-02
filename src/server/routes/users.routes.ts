import { Router } from 'express';
import crypto from 'node:crypto';
import { query, queryOne } from '../db/client.js';
import { authMiddleware, type AuthenticatedRequest } from '../middleware/auth.js';
import { getFullUser } from './auth.routes.js';

export const usersRouter = Router();

// GET /api/colleges - Public list of colleges & communities
usersRouter.get('/colleges', async (req, res): Promise<void> => {
  try {
    const colleges = await query(`SELECT * FROM colleges WHERE is_active = true ORDER BY name ASC`);
    res.json({ colleges });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load colleges.' });
  }
});

// GET /api/categories - Public list of task categories
usersRouter.get('/categories', async (req, res): Promise<void> => {
  try {
    const categories = await query(`SELECT * FROM task_categories WHERE is_active = true ORDER BY name ASC`);
    res.json({ categories });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load categories.' });
  }
});

// GET /api/users/me
usersRouter.get('/me', authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const fullUser = await getFullUser(req.user!.id);
    res.json({ user: fullUser });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

// PATCH /api/users/me - Update user and profile details
usersRouter.patch('/me', authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const userId = req.user!.id;
    const {
      name,
      avatar_url,
      bio,
      college_id,
      department,
      year_of_study,
      skills,
      preferred_categories,
      approx_address,
      approx_lat,
      approx_lng,
      max_purchase_limit,
    } = req.body;

    if (name) {
      await query(`UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2`, [name.trim(), userId]);
    }

    const currentProfile = await queryOne(`SELECT user_id FROM profiles WHERE user_id = $1`, [userId]);
    if (!currentProfile) {
      await query(`INSERT INTO profiles (user_id) VALUES ($1)`, [userId]);
    }

    const updates: string[] = ['updated_at = NOW()'];
    const values: any[] = [userId];
    let idx = 2;

    if (avatar_url !== undefined) {
      updates.push(`avatar_url = $${idx++}`);
      values.push(avatar_url);
    }
    if (bio !== undefined) {
      updates.push(`bio = $${idx++}`);
      values.push(bio);
    }
    if (college_id !== undefined) {
      updates.push(`college_id = $${idx++}`);
      values.push(college_id);
    }
    if (department !== undefined) {
      updates.push(`department = $${idx++}`);
      values.push(department);
    }
    if (year_of_study !== undefined) {
      updates.push(`year_of_study = $${idx++}`);
      values.push(year_of_study);
    }
    if (skills !== undefined) {
      updates.push(`skills = $${idx++}::jsonb`);
      values.push(JSON.stringify(Array.isArray(skills) ? skills : []));
    }
    if (preferred_categories !== undefined) {
      updates.push(`preferred_categories = $${idx++}::jsonb`);
      values.push(JSON.stringify(Array.isArray(preferred_categories) ? preferred_categories : []));
    }
    if (approx_address !== undefined) {
      updates.push(`approx_address = $${idx++}`);
      values.push(approx_address);
    }
    if (approx_lat !== undefined) {
      updates.push(`approx_lat = $${idx++}`);
      values.push(approx_lat);
    }
    if (approx_lng !== undefined) {
      updates.push(`approx_lng = $${idx++}`);
      values.push(approx_lng);
    }
    if (max_purchase_limit !== undefined) {
      updates.push(`max_purchase_limit = $${idx++}`);
      values.push(Number(max_purchase_limit));
    }

    const updateSql = `UPDATE profiles SET ${updates.join(', ')} WHERE user_id = $1`;
    await query(updateSql, values);

    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
      [`log_${crypto.randomUUID()}`, userId, 'PROFILE_UPDATED', 'user', userId, JSON.stringify({ name, college_id })]
    );

    const fullUser = await getFullUser(userId);
    res.json({ user: fullUser });
  } catch (err: any) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// PATCH /api/users/me/availability - Toggle Worker Availability on/off
usersRouter.patch('/me/availability', authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { is_available } = req.body;

    const newStatus = Boolean(is_available);
    await query(`UPDATE profiles SET is_available = $1, updated_at = NOW() WHERE user_id = $2`, [newStatus, userId]);

    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
      [`log_${crypto.randomUUID()}`, userId, 'WORKER_AVAILABILITY_CHANGED', 'profile', userId, JSON.stringify({ is_available: newStatus })]
    );

    const fullUser = await getFullUser(userId);
    res.json({ is_available: newStatus, user: fullUser });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update availability.' });
  }
});

// POST /api/users/me/verification - Submit student/community ID for review
usersRouter.post('/me/verification', authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { college_id, id_card_url, id_number } = req.body;

    if (!id_number && !id_card_url) {
      res.status(400).json({ error: 'Please provide your Student/Resident ID number or upload an ID card photo.' });
      return;
    }

    const verificationId = `ver_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;

    await query(
      `INSERT INTO college_verifications (id, user_id, college_id, id_card_url, id_number, status, submitted_at)
       VALUES ($1, $2, $3, $4, $5, 'PENDING', NOW())`,
      [verificationId, userId, college_id || null, id_card_url || null, id_number || null]
    );

    await query(`UPDATE profiles SET verification_status = 'PENDING', updated_at = NOW() WHERE user_id = $1`, [userId]);

    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
      [`log_${crypto.randomUUID()}`, userId, 'VERIFICATION_SUBMITTED', 'college_verification', verificationId, JSON.stringify({ id_number })]
    );

    const fullUser = await getFullUser(userId);
    res.status(201).json({ success: true, verificationId, user: fullUser });
  } catch (err: any) {
    console.error('Submit verification error:', err);
    res.status(500).json({ error: 'Failed to submit verification request.' });
  }
});

// GET /api/users/me/verification - Get verification requests for current user
usersRouter.get('/me/verification', authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const userId = req.user!.id;
    const verifications = await query(
      `SELECT v.*, c.name as college_name
       FROM college_verifications v
       LEFT JOIN colleges c ON v.college_id = c.id
       WHERE v.user_id = $1
       ORDER BY v.submitted_at DESC`,
      [userId]
    );
    res.json({ verifications });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch verification status.' });
  }
});
