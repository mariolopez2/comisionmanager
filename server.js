const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// --- Login ---
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM operators WHERE username = $1', [username]);
    if (rows.length === 0) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    delete user.password;
    res.json({ message: 'Login exitoso', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// --- Operators ---
app.get('/api/operators', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, firstName, lastName, address, email, username, rol FROM operators ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'DB error' });
  }
});

app.post('/api/operators', async (req, res) => {
  const { firstName, lastName, address, email, username, password, rol } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO operators (firstName, lastName, address, email, username, password, rol)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, firstName, lastName, address, email, username, rol`,
      [firstName, lastName, address, email, username, hash, rol]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'DB error' });
  }
});

app.put('/api/operators/:id', async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, address, email, username, password, rol } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM operators WHERE id=$1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const operator = rows[0];
    const hash = password ? await bcrypt.hash(password, 10) : operator.password;
    const upd = await pool.query(
      `UPDATE operators SET firstName=$1,lastName=$2,address=$3,email=$4,username=$5,password=$6,rol=$7 WHERE id=$8 RETURNING id, firstName, lastName, address, email, username, rol`,
      [firstName, lastName, address, email, username, hash, rol, id]
    );
    res.json(upd.rows[0]);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'DB error' });
  }
});

// --- Routes ---
app.get('/api/routes', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM routes ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'DB error' });
  }
});

app.post('/api/routes', async (req, res) => {
  const { name, operator } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO routes (name, operator) VALUES ($1,$2) RETURNING *',
      [name, operator]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'DB error' });
  }
});

app.put('/api/routes/:id', async (req, res) => {
  const { id } = req.params;
  const { name, operator } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE routes SET name=$1, operator=$2 WHERE id=$3 RETURNING *',
      [name, operator, id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'DB error' });
  }
});

// --- Clients ---
app.get('/api/clients', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM clients ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'DB error' });
  }
});

app.post('/api/clients', async (req, res) => {
  const { firstName, lastName, address, phone, email, commission, route, active } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO clients (firstName,lastName,address,phone,email,commission,route,active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [firstName, lastName, address, phone, email, commission, route, active]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'DB error' });
  }
});

app.put('/api/clients/:id', async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, address, phone, email, commission, route, active } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE clients SET firstName=$1,lastName=$2,address=$3,phone=$4,email=$5,commission=$6,route=$7,active=$8
       WHERE id=$9 RETURNING *`,
      [firstName, lastName, address, phone, email, commission, route, active, id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'DB error' });
  }
});

// --- Machines ---
app.get('/api/machines', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM machines ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'DB error' });
  }
});

app.post('/api/machines', async (req, res) => {
  const { numero, type, fondo, route, client, status, active } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO machines (numero,type,fondo,route,client,status,active)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [numero, type, fondo, route, client, status, active]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'DB error' });
  }
});

app.put('/api/machines/:id', async (req, res) => {
  const { id } = req.params;
  const { numero, type, fondo, route, client, status, active } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE machines SET numero=$1,type=$2,fondo=$3,route=$4,client=$5,status=$6,active=$7
       WHERE id=$8 RETURNING *`,
      [numero, type, fondo, route, client, status, active, id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'DB error' });
  }
});

// --- Cuts ---
app.get('/api/cuts', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM cuts ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'DB error' });
  }
});

app.post('/api/cuts', async (req, res) => {
  const { clientId, operatorId, date, maquinas, total, firma } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO cuts (clientId, operatorId, date, maquinas, total, firma)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [clientId, operatorId, date, JSON.stringify(maquinas), total, firma]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'DB error' });
  }
});

// --- Settings (single row) ---
app.get('/api/settings', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM settings LIMIT 1');
    res.json(rows[0] || {});
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'DB error' });
  }
});

app.put('/api/settings', async (req, res) => {
  const { emailFrom, reportTitle } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE settings SET emailFrom=$1, reportTitle=$2 WHERE id=1 RETURNING *`,
      [emailFrom, reportTitle]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'DB error' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API corriendo en puerto ${PORT}`));
