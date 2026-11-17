require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

app.use(express.static('public'));

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

app.get('/api/packages/:trackingNumber', async (req, res) => {
    try {
        const trackingNumber = req.params.trackingNumber;
        
        const [packageRows] = await pool.query('SELECT * FROM Packages WHERE TrackingNumber = ?', [trackingNumber]);
        
        if (packageRows.length === 0) {
            return res.status(404).json({ message: 'Пратката не е намерена' });
        }

        const packageData = packageRows[0];
        const [statusRows] = await pool.query('SELECT * FROM TrackingStatuses WHERE PackageId = ? ORDER BY EventDateTime DESC', [packageData.Id]);

        res.json({
            package: packageData,
            history: statusRows
        });
    } catch (error) {
        res.status(500).json({ error: 'Грешка в сървъра' });
    }
});

app.post('/api/packages/:id/status', async (req, res) => {
    const packageId = req.params.id;
    const { statusName, location, eventDateTime } = req.body;

    if (!statusName || !location || !eventDateTime) {
        return res.status(400).json({ error: 'Моля, попълнете всички полета за статуса.' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        await connection.query(
            'INSERT INTO TrackingStatuses (PackageId, StatusName, Location, EventDateTime) VALUES (?, ?, ?, ?)',
            [packageId, statusName, location, eventDateTime]
        );

        if (statusName.toLowerCase() === 'доставена') {
            await connection.query(
                'UPDATE Packages SET IsCompleted = TRUE WHERE Id = ?',
                [packageId]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Статусът е добавен успешно.' });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Грешка при запис на статуса. Транзакцията е отменена.' });
    } finally {
        connection.release();
    }
});

app.post('/api/packages', async (req, res) => {
    const { trackingNumber, senderInfo, receiverInfo, description } = req.body;

    if (!trackingNumber || !senderInfo || !receiverInfo) {
        return res.status(400).json({ error: 'Моля, попълнете задължителните полета (номер, изпращач, получател).' });
    }

    try {
        const sendDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        await pool.query(
            'INSERT INTO Packages (TrackingNumber, SenderInfo, ReceiverInfo, Description, SendDate, IsCompleted) VALUES (?, ?, ?, ?, ?, FALSE)',
            [trackingNumber, senderInfo, receiverInfo, description || '', sendDate]
        );

        res.status(201).json({ message: 'Пратката е регистрирана успешно!' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Пратка с този номер (товарителница) вече съществува!' });
        }
        res.status(500).json({ error: 'Грешка в сървъра при запис на пратката.' });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const [total] = await pool.query('SELECT COUNT(*) as count FROM Packages');
        const [completed] = await pool.query('SELECT COUNT(*) as count FROM Packages WHERE IsCompleted = TRUE');
        const active = total[0].count - completed[0].count;

        res.json({
            total: total[0].count,
            active: active,
            completed: completed[0].count
        });
    } catch (error) {
        res.status(500).json({ error: 'Грешка при извличане на статистиката' });
    }
});

app.get('/api/packages', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Packages ORDER BY Id DESC LIMIT 10');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Грешка при извличане на пратките' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сървърът работи на порт ${PORT}`);
});