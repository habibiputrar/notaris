const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('./auth');

// Get all akta
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { search, status, jenis } = req.query;
        let query = 'SELECT * FROM akta WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND (nomor_akta LIKE ? OR jenis_akta LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        if (jenis) {
            query += ' AND jenis_akta = ?';
            params.push(jenis);
        }

        query += ' ORDER BY created_at DESC';

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get single akta
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM akta WHERE id = ?', [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Akta not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create akta
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { nomor_akta, jenis_akta, jenis_lainnya, tanggal, status, nilai } = req.body;

        const [result] = await db.query(
            'INSERT INTO akta (nomor_akta, jenis_akta, jenis_lainnya, tanggal, status, nilai) VALUES (?, ?, ?, ?, ?, ?)',
            [nomor_akta, jenis_akta, jenis_lainnya, tanggal, status, nilai]
        );

        res.status(201).json({
            id: result.insertId,
            message: 'Akta created successfully'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update akta
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { nomor_akta, jenis_akta, jenis_lainnya, tanggal, status, nilai } = req.body;

        const [result] = await db.query(
            'UPDATE akta SET nomor_akta = ?, jenis_akta = ?, jenis_lainnya = ?, tanggal = ?, status = ?, nilai = ? WHERE id = ?',
            [nomor_akta, jenis_akta, jenis_lainnya, tanggal, status, nilai, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Akta not found' });
        }

        res.json({ message: 'Akta updated successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete akta
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM akta WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Akta not found' });
        }

        res.json({ message: 'Akta deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;