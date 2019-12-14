let db = require('../utils/db');

module.exports = {
    findByTutorId: (id) => {
        return db.load(`select RAC.comment, RAC.rate, RAC.date,RAC.id_teacher,user.avatar, user.name
        from rate_and_comment RAC
        join user on user.id = RAC.id_student where id_teacher=${id}`);
    },
    add: (entity) => {
        return db.add('rate_and_comment', entity);
    }
}