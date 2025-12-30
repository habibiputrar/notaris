const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('./auth');

// Get dashboard stats
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        // Get total akta
        const [aktaResult] = await db.query('SELECT COUNT(*) as total FROM akta');
        const totalAkta = aktaResult[0].total;

        // Get total pemasukan
        const [pemasukanResult] = await db.query('SELECT SUM(jumlah) as total FROM transaksi WHERE jenis = "pemasukan"');
        const totalPemasukan = pemasukanResult[0].total || 0;

        // Get total pengeluaran
        const [pengeluaranResult] = await db.query('SELECT SUM(jumlah) as total FROM transaksi WHERE jenis = "pengeluaran"');
        const totalPengeluaran = pengeluaranResult[0].total || 0;

        const saldo = totalPemasukan - totalPengeluaran;

        res.json({
            totalAkta,
            totalPemasukan,
            totalPengeluaran,
            saldo
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get recent activities
router.get('/activities', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT 'akta' as type, nomor_akta as title, jenis_akta as description, created_at 
            FROM akta 
            UNION ALL
            SELECT 'transaksi' as type, keterangan as title, 
                   CONCAT('Rp ', FORMAT(jumlah, 0), ' (', jenis, ')') as description, created_at 
            FROM transaksi 
            ORDER BY created_at DESC 
            LIMIT 10
        `;

        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get laporan
router.get('/laporan', authenticateToken, async (req, res) => {
    try {
        const { bulan, tahun } = req.query;
        
        let dateFilter = '';
        const params = [];

        if (bulan && tahun) {
            dateFilter = 'WHERE MONTH(tanggal) = ? AND YEAR(tanggal) = ?';
            params.push(bulan, tahun);
        }

        // Get akta stats
        const [aktaTotal] = await db.query(`SELECT COUNT(*) as total FROM akta ${dateFilter}`, params);
        const [aktaSelesai] = await db.query(`SELECT COUNT(*) as total FROM akta ${dateFilter} ${dateFilter ? 'AND' : 'WHERE'} status = 'selesai'`, params);
        const [aktaProses] = await db.query(`SELECT COUNT(*) as total FROM akta ${dateFilter} ${dateFilter ? 'AND' : 'WHERE'} status = 'proses'`, params);

        // Get financial stats
        const [pemasukan] = await db.query(`SELECT SUM(jumlah) as total FROM transaksi WHERE jenis = 'pemasukan' ${dateFilter ? 'AND ' + dateFilter.replace('WHERE', '') : ''}`, params);
        const [pengeluaran] = await db.query(`SELECT SUM(jumlah) as total FROM transaksi WHERE jenis = 'pengeluaran' ${dateFilter ? 'AND ' + dateFilter.replace('WHERE', '') : ''}`, params);

        res.json({
            operasional: {
                totalAkta: aktaTotal[0].total,
                aktaSelesai: aktaSelesai[0].total,
                aktaProses: aktaProses[0].total
            },
            keuangan: {
                pemasukan: pemasukan[0].total || 0,
                pengeluaran: pengeluaran[0].total || 0,
                saldo: (pemasukan[0].total || 0) - (pengeluaran[0].total || 0)
            },
            periode: `${bulan}/${tahun}`
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;