const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('./auth');

// Get all inventaris
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { search } = req.query;
        let query = 'SELECT * FROM inventaris WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND nama_barang LIKE ?';
            params.push(`%${search}%`);
        }

        query += ' ORDER BY created_at DESC';

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create inventaris
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { nama_barang, jumlah, tanggal_pembelian, harga_satuan, total_nilai } = req.body;

        const [result] = await db.query(
            'INSERT INTO inventaris (nama_barang, jumlah, tanggal_pembelian, harga_satuan, total_nilai) VALUES (?, ?, ?, ?, ?)',
            [nama_barang, jumlah, tanggal_pembelian, harga_satuan, total_nilai]
        );

        res.status(201).json({
            id: result.insertId,
            message: 'Inventaris created successfully'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update inventaris
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { nama_barang, jumlah, tanggal_pembelian, harga_satuan, total_nilai } = req.body;

        const [result] = await db.query(
            'UPDATE inventaris SET nama_barang = ?, jumlah = ?, tanggal_pembelian = ?, harga_satuan = ?, total_nilai = ? WHERE id = ?',
            [nama_barang, jumlah, tanggal_pembelian, harga_satuan, total_nilai, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Inventaris not found' });
        }

        res.json({ message: 'Inventaris updated successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete inventaris
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM inventaris WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Inventaris not found' });
        }

        res.json({ message: 'Inventaris deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;