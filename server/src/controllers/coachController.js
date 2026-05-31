const db = require('../config/database');

const getAll = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT c.*, p.name as pool_name 
            FROM coaches c
            JOIN pools p ON c.pool_id = p.id
            ORDER BY c.id
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка получения списка тренеров' });
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(`
            SELECT c.*, p.name as pool_name 
            FROM coaches c
            JOIN pools p ON c.pool_id = p.id
            WHERE c.id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Тренер не найден' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка получения тренера' });
    }
};

const getByPoolId = async (req, res) => {
    try {
        const { poolId } = req.params;
        const result = await db.query(
            'SELECT * FROM coaches WHERE pool_id = $1 ORDER BY id',
            [poolId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка получения тренеров по бассейну' });
    }
};

const create = async (req, res) => {
    try {
        const { fullName, poolId, workDays } = req.body;
        
        if (!fullName || !poolId || !workDays) {
            return res.status(400).json({ error: 'Все поля обязательны' });
        }
        
        if (!Array.isArray(workDays) || workDays.some(d => d < 1 || d > 7)) {
            return res.status(400).json({ error: 'workDays должен быть массивом чисел от 1 до 7' });
        }
        
        const result = await db.query(
            'INSERT INTO coaches (full_name, pool_id, work_days) VALUES ($1, $2, $3) RETURNING *',
            [fullName, poolId, workDays]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка создания тренера' });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, poolId, workDays } = req.body;
        
        const updates = [];
        const values = [];
        let paramCount = 1;
        
        if (fullName !== undefined) {
            updates.push(`full_name = $${paramCount++}`);
            values.push(fullName);
        }
        if (poolId !== undefined) {
            updates.push(`pool_id = $${paramCount++}`);
            values.push(poolId);
        }
        if (workDays !== undefined) {
            if (!Array.isArray(workDays) || workDays.some(d => d < 1 || d > 7)) {
                return res.status(400).json({ error: 'workDays должен быть массивом чисел от 1 до 7' });
            }
            updates.push(`work_days = $${paramCount++}`);
            values.push(workDays);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ error: 'Нет данных для обновления' });
        }
        
        values.push(id);
        
        const result = await db.query(
            `UPDATE coaches SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Тренер не найден' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка обновления тренера' });
    }
};

const deleteCoach = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM coaches WHERE id = $1 RETURNING id', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Тренер не найден' });
        }
        
        res.json({ message: 'Тренер успешно удалён' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка удаления тренера' });
    }
};

module.exports = {
    getAll,
    getById,
    getByPoolId,
    create,
    update,
    deleteCoach
};