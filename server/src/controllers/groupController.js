const db = require('../config/database');

const getAll = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT g.*, p.name as pool_name, s.name as subscription_name
            FROM groups g
            JOIN pools p ON g.pool_id = p.id
            JOIN subscriptions s ON g.subscription_id = s.id
            ORDER BY g.id
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка получения списка групп' });
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(`
            SELECT g.*, p.name as pool_name, s.name as subscription_name
            FROM groups g
            JOIN pools p ON g.pool_id = p.id
            JOIN subscriptions s ON g.subscription_id = s.id
            WHERE g.id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Группа не найдена' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка получения группы' });
    }
};

const getByPoolId = async (req, res) => {
    try {
        const { poolId } = req.params;
        const result = await db.query(`
            SELECT g.*, s.name as subscription_name
            FROM groups g
            JOIN subscriptions s ON g.subscription_id = s.id
            WHERE g.pool_id = $1
            ORDER BY g.id
        `, [poolId]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка получения групп по бассейну' });
    }
};

const create = async (req, res) => {
    try {
        const { number, category, poolId, subscriptionId } = req.body;
        
        if (!number || !category || !poolId || !subscriptionId) {
            return res.status(400).json({ error: 'Все поля обязательны' });
        }
        
        const validCategories = ['beginners', 'teens', 'adults', 'athletes'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ error: 'Неверная категория группы' });
        }
        
        const result = await db.query(
            `INSERT INTO groups (number, category, pool_id, subscription_id) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [number, category, poolId, subscriptionId]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка создания группы' });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { number, category, poolId, subscriptionId } = req.body;
        
        const updates = [];
        const values = [];
        let paramCount = 1;
        
        if (number !== undefined) {
            updates.push(`number = $${paramCount++}`);
            values.push(number);
        }
        if (category !== undefined) {
            const validCategories = ['beginners', 'teens', 'adults', 'athletes'];
            if (!validCategories.includes(category)) {
                return res.status(400).json({ error: 'Неверная категория группы' });
            }
            updates.push(`category = $${paramCount++}`);
            values.push(category);
        }
        if (poolId !== undefined) {
            updates.push(`pool_id = $${paramCount++}`);
            values.push(poolId);
        }
        if (subscriptionId !== undefined) {
            updates.push(`subscription_id = $${paramCount++}`);
            values.push(subscriptionId);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ error: 'Нет данных для обновления' });
        }
        
        values.push(id);
        
        const result = await db.query(
            `UPDATE groups SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Группа не найдена' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка обновления группы' });
    }
};

const deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM groups WHERE id = $1 RETURNING id', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Группа не найдена' });
        }
        
        res.json({ message: 'Группа успешно удалена' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка удаления группы' });
    }
};

module.exports = {
    getAll,
    getById,
    getByPoolId,
    create,
    update,
    deleteGroup
};