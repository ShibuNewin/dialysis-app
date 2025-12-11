import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- AUTHENTICATION ROUTES ---

// 1. REGISTER (New Patient)
app.post('/register', async (req, res) => {
  const { name, email, password, patientId, roomNumber } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password, patient_id, room_number) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, email, password, patientId, roomNumber]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'User already exists or invalid data' });
  }
});

// 2. LOGIN (Check Password)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (result.rows.length === 0) throw new Error();
    res.json(result.rows[0]);
  } catch (err) {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// --- ADMIN ROUTES (NEW) ---

// 3. CREATE NEW SHIFT (Satisfies Admin Requirement)
app.post('/admin/shifts', async (req, res) => {
  const { center_id, start_time, date } = req.body;
  try {
    // 1. Create the Shift
    const result = await pool.query(
      'INSERT INTO shifts (center_id, start_time, date) VALUES ($1, $2, $3) RETURNING *',
      [center_id, start_time, date]
    );
    
    // 2. Automatically generate slots for this new shift (10 Standard + 5 Premium)
    const newShiftId = result.rows[0].id;
    await pool.query(`
      INSERT INTO slots (shift_id, machine_id, status)
      SELECT $1, id, 'AVAILABLE' FROM machines WHERE center_id = $2
    `, [newShiftId, center_id]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create shift' });
  }
});

// --- DASHBOARD DATA ROUTES ---

// 4. GET SHIFTS
app.get('/shifts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM shifts ORDER BY id');
    res.json(result.rows);
  } catch (err) { res.status(500).json(err); }
});

// 5. GET SLOTS (Updated to include booked_by_user_id)
app.get('/slots', async (req, res) => {
  const { shiftId, tier } = req.query; 
  try {
    const result = await pool.query(
      `SELECT s.id, s.status, s.booked_by_user_id, m.machine_number, m.type, m.tier, m.price, s.shift_id
       FROM slots s 
       JOIN machines m ON s.machine_id = m.id 
       WHERE s.shift_id = $1 AND m.tier = $2
       ORDER BY m.machine_number ASC`,
      [shiftId, tier]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

// --- BOOKING ROUTES ---

// 6. BOOK (Handles Payment Status & Locking)
app.post('/book', async (req, res) => {
  const { slotId, userId, paymentStatus } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Start Transaction

    // Lock the slot
    const slotCheck = await client.query('SELECT status FROM slots WHERE id = $1 FOR UPDATE', [slotId]);
    
    if (slotCheck.rows[0].status !== 'AVAILABLE') {
      throw new Error('Slot already taken');
    }

    // Update Slot with User and Payment Status
    await client.query(
      `UPDATE slots SET status = 'BOOKED', booked_by_user_id = $1, payment_status = $2 
       WHERE id = $3`,
      [userId, paymentStatus || 'COMPLETED', slotId]
    );

    await client.query('COMMIT');
    res.json({ message: 'Booking Successful' });

  } catch (err: any) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

// 7. WITHDRAW / CANCEL BOOKING
app.post('/withdraw', async (req, res) => {
  const { slotId, userId } = req.body;
  
  try {
    // Only allow withdrawing if the user actually owns the booking
    const result = await pool.query(
      `UPDATE slots 
       SET status = 'AVAILABLE', booked_by_user_id = NULL, payment_status = 'PENDING' 
       WHERE id = $1 AND booked_by_user_id = $2 RETURNING id`,
      [slotId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Booking not found or you do not own this slot.' });
    }

    res.json({ message: 'Booking Withdrawn Successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Withdrawal failed' });
  }
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});