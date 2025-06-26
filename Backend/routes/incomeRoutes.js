const express = require('express');
const Income = require('../models/Income');
const auth = require('../middleware/authMiddleware');
const router = express.Router();
const ExcelJS = require('exceljs');

// Add income
router.post('/', auth, async (req, res) => {
    try {
        const { source, amount, date } = req.body;
        const income = new Income({
            user: req.user,
            source,
            amount,
            date
        });
        await income.save();
        res.status(201).json(income);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all incomes for user
router.get('/', auth, async (req, res) => {
    try {
        const incomes = await Income.find({ user: req.user }).sort({ date: -1 });
        res.json(incomes);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete income
router.delete('/:id', auth, async (req, res) => {
    try {
        await Income.findOneAndDelete({ _id: req.params.id, user: req.user });
        res.json({ message: 'Income deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Export income to Excel
router.get('/export/excel', auth, async (req, res) => {
    try {
        const incomes = await Income.find({ user: req.user }).sort({ date: -1 });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Income');

        worksheet.columns = [
            { header: 'Source', key: 'source', width: 30 },
            { header: 'Amount', key: 'amount', width: 15 },
            { header: 'Date', key: 'date', width: 20 }
        ];

        incomes.forEach(income => {
            worksheet.addRow({
                source: income.source,
                amount: income.amount,
                date: income.date.toISOString().split('T')[0]
            });
        });

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + 'income.xlsx'
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
