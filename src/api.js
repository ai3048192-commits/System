const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// اتصال قاعدة البيانات (MySQL)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'store_db'
});

db.connect(err => {
    if (err) {
        console.error('خطأ في الاتصال بقاعدة البيانات:', err);
        return;
    }
    console.log('تم الاتصال بقاعدة البيانات store_db بنجاح!');
});

// --- إنشاء جدول الحركات الموحد (Transactions) المتوافق مع الـ Frontend ---
db.query(`
    CREATE TABLE IF NOT EXISTS transactions (
        id BIGINT PRIMARY KEY,
        date VARCHAR(255),
        month VARCHAR(255),
        type VARCHAR(50),
        amount DECIMAL(10,2),
        \`desc\` TEXT,
        subtype VARCHAR(255),
        isEmp BOOLEAN DEFAULT 0,
        empName VARCHAR(100)
    )
`, (err) => {
    if (err) console.error("خطأ في إنشاء جدول transactions:", err);
    else console.log("تم التحقق من جدول transactions بنجاح.");
});

// --- مسارات الـ Transactions (متوافقة 100% مع الـ React) ---

// 1. جلب كل العمليات
app.get('/api/transactions', (req, res) => {
    db.query('SELECT * FROM transactions ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const formatted = results.map(t => ({
            ...t,
            isEmp: Boolean(t.isEmp)
        }));
        res.json(formatted);
    });
});

// 2. إضافة عملية جديدة
app.post('/api/transactions', (req, res) => {
    const { id, date, month, type, amount, desc, subtype, isEmp, empName } = req.body;
    const query = `
        INSERT INTO transactions (id, date, month, type, amount, \`desc\`, subtype, isEmp, empName) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [id, date, month, type, amount, desc, subtype, isEmp ? 1 : 0, empName || ''], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'تم حفظ الحركة بنجاح' });
    });
});

// 3. تعديل عملية موجودة
app.put('/api/transactions/:id', (req, res) => {
    const { id } = req.params;
    const { date, month, amount, desc, subtype, isEmp, empName } = req.body;
    const query = `
        UPDATE transactions 
        SET date = ?, month = ?, amount = ?, \`desc\` = ?, subtype = ?, isEmp = ?, empName = ? 
        WHERE id = ?
    `;
    db.query(query, [date, month, amount, desc, subtype, isEmp ? 1 : 0, empName || '', id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'تم تعديل الحركة بنجاح' });
    });
});

// 4. حذف عملية
app.delete('/api/transactions/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM transactions WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'تم حذف الحركة بنجاح' });
    });
});

// تشغيل الخادم
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`الخادم يعمل على المنفذ ${PORT}`);
});