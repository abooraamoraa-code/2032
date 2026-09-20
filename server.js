const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001; // منفصل تماماً برقم بورت مختلف (3001 مثلاً أو حسب اختيارك)

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// إنشاء والاتصال بقاعدة بيانات جديدة ومستقلة تماماً للمشروع الثاني
const dbFile = path.join(__dirname, 'database2.sqlite');
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('خطأ في الاتصال بقاعدة بيانات المشروع الثاني:', err.message);
    } else {
        console.log('تم الاتصال بقاعدة بيانات المشروع الثاني بنجاح (database2.sqlite).');
    }
});

// إنشاء الجدول الخاص بهذا المشروع فقط
db.run(`CREATE TABLE IF NOT EXISTS project2_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
    if (!err) {
        console.log('تم التحقق من جدول المشروع الثاني أو إنشاؤه بنجاح.');
    }
});

// API للحصول على البيانات
app.get('/api/data', (req, res) => {
    const status = req.query.status;
    let query = "SELECT * FROM project2_data";
    let params = [];

    if (status) {
        query += " WHERE status = ?";
        params.push(status);
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// API لإضافة بيانات جديدة للمشروع الثاني
app.post('/api/data', (req, res) => {
    const { item_name, description } = req.body;
    
    if (!item_name) {
        return res.status(400).json({ error: 'اسم العنصر مطلوب' });
    }

    const query = `INSERT INTO project2_data (item_name, description, status) VALUES (?, ?, 'active')`;
    db.run(query, [item_name, description || ''], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ 
                message: 'تمت الإضافة إلى المشروع الثاني بنجاح',
                id: this.lastID 
            });
        }
    });
});

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`سيرفر المشروع الثاني يعمل الآن على الرابط: http://localhost:${PORT}`);
});
