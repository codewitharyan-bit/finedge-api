const validator = (req, res, next) => {
    const {amount , type} = req.body;
    if(amount <= 0) {
        return res.status(400).json({ error: 'Amount must be greater than zero' });
    }
    if(!['income', 'expense'].includes(type)) {
        return res.status(400).json({ error: 'Type must be either income or expense' });
    }
    next();
}

module.exports = validator;