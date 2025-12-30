const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('./auth');

// Get all pegawai
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { search, jabatan } = req.query;
        let query = 'SELECT * FROM pegawai WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND nama LIKE ?';
            params.push(`%${search}%`);
        }

        if (jabatan) {
            query += ' AND jabatan = ?';
            params.push(jabatan);
        }

        query += ' ORDER BY created_at DESC';

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create pegawai
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { nama, jabatan, kontak, email, status_akun, username, password } = req.body;

        let userId = null;

        // If creating user account
        if (username && password) {
            const [userResult] = await db.query(
                'INSERT INTO users (username, password, nama, role) VALUES (?, ?, ?, ?)',
                [username, password, nama, 'staff']
            );
            userId = userResult.insertId;
        }

        const [result] = await db.query(
            'INSERT INTO pegawai (nama, jabatan, kontak, email, status_akun, user_id) VALUES (?, ?, ?, ?, ?, ?)',
            [nama, jabatan, kontak, email, status_akun || 'aktif', userId]
        );

        res.status(201).json({
            id: result.insertId,
            message: 'Pegawai created successfully'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update pegawai
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { nama, jabatan, kontak, email, status_akun } = req.body;

        const [result] = await db.query(
            'UPDATE pegawai SET nama = ?, jabatan = ?, kontak = ?, email = ?, status_akun = ? WHERE id = ?',
            [nama, jabatan, kontak, email, status_akun, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pegawai not found' });
        }

        res.json({ message: 'Pegawai updated successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete pegawai
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM pegawai WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pegawai not found' });
        }

        res.json({ message: 'Pegawai deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;