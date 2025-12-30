const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('./auth');

// Get all transaksi
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { search, jenis } = req.query;
        let query = 'SELECT t.*, a.nomor_akta FROM transaksi t LEFT JOIN akta a ON t.akta_id = a.id WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND (t.keterangan LIKE ? OR t.kategori LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (jenis) {
            query += ' AND t.jenis = ?';
            params.push(jenis);
        }

        query += ' ORDER BY t.created_at DESC';

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create transaksi
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { jenis, tanggal, keterangan, kategori, jumlah, akta_id } = req.body;

        const [result] = await db.query(
            'INSERT INTO transaksi (jenis, tanggal, keterangan, kategori, jumlah, akta_id) VALUES (?, ?, ?, ?, ?, ?)',
            [jenis, tanggal, keterangan, kategori, jumlah, akta_id || null]
        );

        res.status(201).json({
            id: result.insertId,
            message: 'Transaksi created successfully'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update transaksi
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { jenis, tanggal, keterangan, kategori, jumlah, akta_id } = req.body;

        const [result] = await db.query(
            'UPDATE transaksi SET jenis = ?, tanggal = ?, keterangan = ?, kategori = ?, jumlah = ?, akta_id = ? WHERE id = ?',
            [jenis, tanggal, keterangan, kategori, jumlah, akta_id || null, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Transaksi not found' });
        }

        res.json({ message: 'Transaksi updated successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete transaksi
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM transaksi WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Transaksi not found' });
        }

        res.json({ message: 'Transaksi deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;