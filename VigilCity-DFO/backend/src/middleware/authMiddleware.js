const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Obtener el token del encabezado

    if (!token) {
        return res.status(401).json({ error: 'No se proporcionó token' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Token no válido' });
        }
        req.userId = decoded.id; // Almacenar el ID del usuario en la solicitud
        next();
    });
};

module.exports = authMiddleware;
