const validate = (schema) => (req, res, next) => {
    const { body } = req;
    const errors = [];

    for (const key in schema) {
        const rules = schema[key];
        const value = body[key];

        if (rules.required && (value === undefined || value === null || String(value).trim() === '')) {
            errors.push(`${key} is required.`);
            continue;
        }

        // Skip other validations if not required and not present
        if (!rules.required && (value === undefined || value === null || value === '')) {
            continue;
        }

        if (rules.isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.push(`${key} must be a valid email address.`);
        }

        if (rules.minLength && String(value).length < rules.minLength) {
            errors.push(`${key} must be at least ${rules.minLength} characters long.`);
        }

        if (rules.maxLength && String(value).length > rules.maxLength) {
            errors.push(`${key} must not exceed ${rules.maxLength} characters.`);
        }
        
        if (rules.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value)) {
            errors.push(`${key} must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.`);
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({ message: errors.join(' ') });
    }

    next();
};

const schemas = {
    register: {
        email: { required: true, isEmail: true },
        name: { required: true, minLength: 2 },
        password: { required: true, password: true },
    },
    createArticle: {
        title: { required: true, minLength: 5 },
        description: { required: true, minLength: 10 },
        body: { required: true, minLength: 50 },
        author: { required: true },
        category: { required: true },
    },
    createComment: {
        body: { required: true, minLength: 1, maxLength: 2000 },
    }
};

const validateRegistration = validate(schemas.register);
const validateArticle = validate(schemas.createArticle);
const validateComment = validate(schemas.createComment);

module.exports = { validateRegistration, validateArticle, validateComment };
