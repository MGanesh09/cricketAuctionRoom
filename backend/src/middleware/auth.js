const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access Denied: No Token Provided!' });

    try {
        const jwtSecret = process.env.JWT_SECRET || 'cricketAuction_default_jwt_secret';
        const decoded = jwt.verify(token.replace('Bearer ', ''), jwtSecret);
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(401).json({ message: 'Session Expired' });
    }
};
