const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '7d' }
    );
};

const generateRefreshToken = async (userId) => {
    const refreshToken = jwt.sign(
        { id: userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );
    
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
    let expiresAt = new Date();
    if (expiresIn.includes('d')) {
        const days = parseInt(expiresIn);
        expiresAt.setDate(expiresAt.getDate() + days);
    } else if (expiresIn.includes('h')) {
        const hours = parseInt(expiresIn);
        expiresAt.setHours(expiresAt.getHours() + hours);
    }
    
    await db.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [userId, refreshToken, expiresAt]
    );
    
    return refreshToken;
};

const deleteRefreshToken = async (refreshToken) => {
    await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
};

const getRefreshTokenFromCookie = (req) => {
    return req.cookies?.refresh_token || null;
};

const setRefreshTokenCookie = (res, refreshToken) => {
    const maxAge = 30 * 24 * 60 * 60 * 1000;
    
    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: maxAge
    });
};

const clearRefreshTokenCookie = (res) => {
    res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
};

const register = async (req, res) => {
    try {
        const { email, password, fullName } = req.body;
        
        if (!email || !password || !fullName) {
            return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ error: 'Пароль должен содержать минимум 6 символов' });
        }
        
        const existingUser = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );
        
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }
        
        const passwordHash = await bcrypt.hash(password, 10);
        
        const result = await db.query(
            `INSERT INTO users (email, password_hash, full_name, role) 
             VALUES ($1, $2, $3, 'client') 
             RETURNING id, email, full_name, role`,
            [email, passwordHash, fullName]
        );
        
        const user = result.rows[0];
        
        const accessToken = generateAccessToken(user);
        const refreshToken = await generateRefreshToken(user.id);
        
        setRefreshTokenCookie(res, refreshToken);
        
        res.status(201).json({
            access_token: accessToken,
            token_type: 'bearer',
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email и пароль обязательны' });
        }
        
        const result = await db.query(
            'SELECT id, email, password_hash, full_name, role FROM users WHERE email = $1',
            [email]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }
        
        const user = result.rows[0];
        
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }
        
        const accessToken = generateAccessToken(user);
        const refreshToken = await generateRefreshToken(user.id);
        
        setRefreshTokenCookie(res, refreshToken);
        
        res.json({
            access_token: accessToken,
            token_type: 'bearer',
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};

const refresh = async (req, res) => {
    try {
        const refreshToken = getRefreshTokenFromCookie(req);
        
        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh токен не найден' });
        }
        
        const tokenResult = await db.query(
            'SELECT user_id, expires_at FROM refresh_tokens WHERE token = $1',
            [refreshToken]
        );
        
        if (tokenResult.rows.length === 0) {
            return res.status(401).json({ error: 'Refresh токен не найден' });
        }
        
        const tokenData = tokenResult.rows[0];
        
        if (new Date(tokenData.expires_at) < new Date()) {
            await deleteRefreshToken(refreshToken);
            return res.status(401).json({ error: 'Refresh токен истёк' });
        }
        
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch (error) {
            await deleteRefreshToken(refreshToken);
            return res.status(401).json({ error: 'Неверный refresh токен' });
        }
        
        const userResult = await db.query(
            'SELECT id, email, role FROM users WHERE id = $1',
            [decoded.id]
        );
        
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Пользователь не найден' });
        }
        
        const user = userResult.rows[0];
        
        const newAccessToken = generateAccessToken(user);
        
        res.json({
            access_token: newAccessToken,
            token_type: 'bearer'
        });
    } catch (error) {
        console.error('Ошибка обновления токена:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};

const getMe = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const result = await db.query(
            'SELECT id, email, full_name, role FROM users WHERE id = $1',
            [userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        
        const user = result.rows[0];
        
        res.json({
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
            phone: user.phone
        });
    } catch (error) {
        console.error('Ошибка получения пользователя:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};

const logout = async (req, res) => {
    try {
        const refreshToken = getRefreshTokenFromCookie(req);
        
        if (refreshToken) {
            await deleteRefreshToken(refreshToken);
        }
        
        clearRefreshTokenCookie(res);
        
        res.json({ message: 'Вы успешно вышли из системы' });
    } catch (error) {
        console.error('Ошибка выхода:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};

module.exports = {
    register,
    login,
    refresh,
    getMe,
    logout
};