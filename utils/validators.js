// Centralized validation helpers
const validateId = (id) => {
    const mongoose = require('mongoose');
    return mongoose.Types.ObjectId.isValid(id);
};

const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, ''); // Basic XSS protection
};

module.exports = { validateId, sanitizeInput };