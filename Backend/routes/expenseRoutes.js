const express = require('express');
const Expense = require('../models/Expense');
const auth = require('../middleware/authMiddleware');
const router = express.Router();
const ExcelJS = require('exceljs');

// Add expense
router.post('/', auth, async (req, res) => {
    try {
        const { title, amount, category, date } = req.body;
        const expense = new Expense({
            user: req.user,
            title,
            amount,
            category,
            date
        });
        await expense.save();
        res.status(201).json(expense);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all expenses for user
router.get('/', auth, async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user }).sort({ date: -1 });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete expense
router.delete('/:id', auth, async (req, res) => {
    try {
        await Expense.findOneAndDelete({ _id: req.params.id, user: req.user });
        res.json({ message: 'Expense deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Export expenses to Excel
router.get('/export/excel', auth, async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user }).sort({ date: -1 });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Expenses');

        worksheet.columns = [
            { header: 'Title', key: 'title', width: 30 },
            { header: 'Amount', key: 'amount', width: 15 },
            { header: 'Category', key: 'category', width: 20 },
            { header: 'Date', key: 'date', width: 20 }
        ];

        expenses.forEach(expense => {
            worksheet.addRow({
                title: expense.title,
                amount: expense.amount,
                category: expense.category,
                date: expense.date.toISOString().split('T')[0]
            });
        });

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + 'expenses.xlsx'
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
