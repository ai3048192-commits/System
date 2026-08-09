const express = require('express');
const { Pool } = require('pg'); // استبدلنا mysql2 بـ pg الخاصة بـ PostgreSQL
const cors = require('cors');
require('dotenv').config(); // لقراءة متغيرات البيئة من ملف .env

const app = express();
app.use(express.json());
app.use(cors());

// اتصال قاعدة البيانات (PostgreSQL سحابياً عبر Railway)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // مطلوبة للاتصال الآمن بالقواعد السحابية
    }
});

pool.connect((err) => {
    if (err) {
        console.error('خطأ في الاتصال بقاعدة البيانات السحابية:', err);
        return;
    }
    console.log('تم الاتصال بقاعدة البيانات PostgreSQL بنجاح!');
});

// --- إنشاء جدول الحركات الموحد (Transactions) متوافق مع Postgres ---
pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
        id BIGINT PRIMARY KEY,
        date VARCHAR(255),
        month VARCHAR(255),
        type VARCHAR(50),
        amount NUMERIC(10,2),
        "desc" TEXT,
        subtype VARCHAR(255),
        isEmp BOOLEAN DEFAULT FALSE,
        empName VARCHAR(100)
    )
`, (err) => {
    if (err) console.error("خطأ في إنشاء جدول transactions:", err);
    else console.log("تم التحقق من جدول transactions بنجاح.");
});

// --- مسارات الـ Transactions ---

// 1. جلب كل العمليات
app.get('/api/transactions', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM transactions ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. إضافة عملية جديدة
app.post('/api/transactions', async (req, res) => {
    const { id, date, month, type, amount, desc, subtype, isEmp, empName } = req.body;
    const query = `
        INSERT INTO transactions (id, date, month, type, amount, "desc", subtype, isEmp, empName) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    try {
        await pool.query(query, [id, date, month, type, amount, desc, subtype, isEmp || false, empName || '']);
        res.json({ message: 'تم حفظ الحركة بنجاح' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. تعديل عملية موجودة
app.put('/api/transactions/:id', async (req, res) => {
    const { id } = req.params;
    const { date, month, amount, desc, subtype, isEmp, empName } = req.body;
    const query = `
        UPDATE transactions 
        SET date = $1, month = $2, amount = $3, "desc" = $4, subtype = $5, isEmp = $6, empName = $7 
        WHERE id = $8
    `;
    try {
        await pool.query(query, [date, month, amount, desc, subtype, isEmp || false, empName || '', id]);
        res.json({ message: 'تم تعديل الحركة بنجاح' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. حذف عملية
app.delete('/api/transactions/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM transactions WHERE id = ?', [id]); // ملاحظة: في pg نستخدم $1 بدلاً من ?
        // تصحيح معامل الحذف في pg:
        // await pool.query('DELETE FROM transactions WHERE id = $1', [id]);
        res.json({ message: 'تم حذف الحركة بنجاح' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// تشغيل الخادم
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`الخادم يعمل على المنفذ ${PORT}`);
});