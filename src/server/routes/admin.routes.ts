import { Router } from 'express';
import crypto from 'node:crypto';
import { query, queryOne } from '../db/client.js';
import { authMiddleware, adminMiddleware, type AuthenticatedRequest } from '../middleware/auth.js';

export const adminRouter = Router();

// Require both auth and admin role
adminRouter.use(authMiddleware);
adminRouter.use(adminMiddleware);

// GET /api/admin/stats
adminRouter.get('/stats', async (req, res): Promise<void> => {
  try {
    const totalUsersRow = await queryOne(`SELECT COUNT(*) as count FROM users`);
    const verifiedUsersRow = await queryOne(`SELECT COUNT(*) as count FROM profiles WHERE verification_status = 'VERIFIED'`);
    const pendingVerRow = await queryOne(`SELECT COUNT(*) as count FROM college_verifications WHERE status = 'PENDING'`);
    const availableWorkersRow = await queryOne(`SELECT COUNT(*) as count FROM profiles WHERE is_available = true`);
    const collegesRow = await queryOne(`SELECT COUNT(*) as count FROM colleges WHERE is_active = true`);

    res.json({
      stats: {
        totalUsers: Number(totalUsersRow?.count || 0),
        verifiedUsers: Number(verifiedUsersRow?.count || 0),
        pendingVerifications: Number(pendingVerRow?.count || 0),
        availableWorkers: Number(availableWorkersRow?.count || 0),
        totalColleges: Number(collegesRow?.count || 0),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve admin stats.' });
  }
});

// GET /api/admin/users
adminRouter.get('/users', async (req, res): Promise<void> => {
  try {
    const { search, status, verification } = req.query;

    let sql = `
      SELECT u.id, u.email, u.phone, u.name, u.role, u.account_status, u.email_verified, u.phone_verified, u.created_at,
             p.avatar_url, p.department, p.year_of_study, p.is_available, p.verification_status, p.rating_avg, p.tasks_completed, p.tasks_posted,
             c.name as college_name, c.code as college_code
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN colleges c ON p.college_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let idx = 1;

    if (search) {
      sql += ` AND (LOWER(u.name) LIKE $${idx} OR LOWER(u.email) LIKE $${idx})`;
      params.push(`%${String(search).toLowerCase()}%`);
      idx++;
    }

    if (status) {
      sql += ` AND u.account_status = $${idx++}`;
      params.push(status);
    }

    if (verification) {
      sql += ` AND p.verification_status = $${idx++}`;
      params.push(verification);
    }

    sql += ` ORDER BY u.created_at DESC LIMIT 100`;

    const users = await query(sql, params);
    res.json({ users });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// PATCH /api/admin/users/:id/status - Suspend / Unsuspend user
adminRouter.patch('/users/:id/status', async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const targetUserId = req.params.id;
    const { status } = req.body;

    if (status !== 'active' && status !== 'suspended') {
      res.status(400).json({ error: 'Status must be active or suspended.' });
      return;
    }

    if (targetUserId === req.user!.id) {
      res.status(400).json({ error: 'Admins cannot suspend their own account.' });
      return;
    }

    await query(`UPDATE users SET account_status = $1, updated_at = NOW() WHERE id = $2`, [status, targetUserId]);

    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
      [`log_${crypto.randomUUID()}`, req.user!.id, 'USER_STATUS_CHANGED', 'user', targetUserId, JSON.stringify({ status })]
    );

    res.json({ success: true, userId: targetUserId, status });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update user status.' });
  }
});

// GET /api/admin/verifications - List ID verifications
adminRouter.get('/verifications', async (req, res): Promise<void> => {
  try {
    const { status } = req.query;

    let sql = `
      SELECT v.*, u.name as user_name, u.email as user_email, u.phone as user_phone,
             c.name as college_name, c.code as college_code
      FROM college_verifications v
      JOIN users u ON v.user_id = u.id
      LEFT JOIN colleges c ON v.college_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (status) {
      sql += ` AND v.status = $1`;
      params.push(status);
    }
    sql += ` ORDER BY v.submitted_at DESC LIMIT 100`;

    const verifications = await query(sql, params);
    res.json({ verifications });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load verifications.' });
  }
});

// POST /api/admin/verifications/:id/review - Approve or Reject verification
adminRouter.post('/verifications/:id/review', async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const verificationId = req.params.id;
    const { action, notes } = req.body; // action: 'APPROVE' | 'REJECT'

    if (action !== 'APPROVE' && action !== 'REJECT') {
      res.status(400).json({ error: 'Action must be APPROVE or REJECT.' });
      return;
    }

    const verification = await queryOne<any>(`SELECT * FROM college_verifications WHERE id = $1`, [verificationId]);
    if (!verification) {
      res.status(404).json({ error: 'Verification request not found.' });
      return;
    }

    const newStatus = action === 'APPROVE' ? 'VERIFIED' : 'REJECTED';

    await query(
      `UPDATE college_verifications 
       SET status = $1, reviewed_by = $2, reviewer_notes = $3, reviewed_at = NOW() 
       WHERE id = $4`,
      [newStatus, req.user!.id, notes || null, verificationId]
    );

    await query(
      `UPDATE profiles SET verification_status = $1, updated_at = NOW() WHERE user_id = $2`,
      [newStatus, verification.user_id]
    );

    await query(
      `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
      [
        `log_${crypto.randomUUID()}`,
        req.user!.id,
        `VERIFICATION_${newStatus}`,
        'college_verification',
        verificationId,
        JSON.stringify({ userId: verification.user_id, status: newStatus, notes }),
      ]
    );

    res.json({ success: true, verificationId, status: newStatus });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to review verification.' });
  }
});

// GET /api/admin/audit-logs
adminRouter.get('/audit-logs', async (req, res): Promise<void> => {
  try {
    const logs = await query(`SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50`);
    res.json({ logs });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load audit logs.' });
  }
});
