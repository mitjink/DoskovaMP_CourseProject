const db = require('../config/database');

const getAll = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM pools ORDER BY id');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка получения списка бассейнов' });
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM pools WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Бассейн не найден' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка получения бассейна' });
    }
};

const create = async (req, res) => {
    try {
        const { name, address, type } = req.body;
        
        if (!name || !address || !type) {
            return res.status(400).json({ error: 'Все поля обязательны' });
        }
        
        const validTypes = ['sport', 'wellness', 'combined'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ error: 'Неверный тип бассейна' });
        }
        
        const result = await db.query(
            'INSERT INTO pools (name, address, type) VALUES ($1, $2, $3) RETURNING *',
            [name, address, type]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка создания бассейна' });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address, type } = req.body;
        
        const updates = [];
        const values = [];
        let paramCount = 1;
        
        if (name !== undefined) {
            updates.push(`name = $${paramCount++}`);
            values.push(name);
        }
        if (address !== undefined) {
            updates.push(`address = $${paramCount++}`);
            values.push(address);
        }
        if (type !== undefined) {
            updates.push(`type = $${paramCount++}`);
            values.push(type);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ error: 'Нет данных для обновления' });
        }
        
        values.push(id);
        
        const result = await db.query(
            `UPDATE pools SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Бассейн не найден' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка обновления бассейна' });
    }
};

const deletePool = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM pools WHERE id = $1 RETURNING id', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Бассейн не найден' });
        }
        
        res.json({ message: 'Бассейн успешно удалён' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка удаления бассейна' });
    }
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    deletePool
};