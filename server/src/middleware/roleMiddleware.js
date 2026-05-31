const roleMiddleware = (allowedRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Пользователь не аутентифицирован' });
        }
        
        if (req.user.role !== allowedRole) {
            return res.status(403).json({ error: 'Доступ запрещён. Недостаточно прав' });
        }
        
        next();
    };
};

module.exports = roleMiddleware;