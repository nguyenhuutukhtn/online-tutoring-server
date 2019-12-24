let db = require('../utils/db');

module.exports = {
    add: (entity) => {
        return db.add('complain', entity);
    },
}