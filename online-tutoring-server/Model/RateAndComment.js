let db = require('../utils/db');

module.exports = {
    findByIdTutor: (id) => {
        return db.load(`select * from rate_and_comment where id_teacher=${id}`);
    },
    add: (entity) => {
        return db.add('rate_and_comment', entity);
    }
}