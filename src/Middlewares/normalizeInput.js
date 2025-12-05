const trimAndAssign = (obj, field) => {
    if (obj[field] && typeof obj[field] === 'string') {
        obj[field] = obj[field].trim();
    }
};

export const normalizeAuthFields = (req, res, next) => {
    if (req.body.email && typeof req.body.email === 'string') {
        req.body.email = req.body.email.toLowerCase().trim();
    }

    if (req.body.phoneNumber && typeof req.body.phoneNumber === 'string') {
        req.body.phoneNumber = req.body.phoneNumber.replace(/\D/g, ''); 
    }

    trimAndAssign(req.body, 'userName');
    
    if (req.body.name) {
        trimAndAssign(req.body.name, 'first');
        trimAndAssign(req.body.name, 'last');
    }
    
    if (req.body.address) {
        trimAndAssign(req.body.address, 'government');
        trimAndAssign(req.body.address, 'city');
        trimAndAssign(req.body.address, 'street');
    }

    trimAndAssign(req.body, 'ssn');

    next();
};