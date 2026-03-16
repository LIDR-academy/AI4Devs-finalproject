const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack); // Imprimir el error en la consola
    res.status(500).json({ error: 'Algo salió mal, por favor intenta de nuevo.' });
};

module.exports = errorMiddleware;
