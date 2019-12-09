let db = require('../utils/db');

module.exports = {
    findByIdTutor: (id) => {
        return db.load(`SELECT tag_tutor.*, tagskill.name FROM tag_tutor
        join tagskill on tag_tutor.id_tag = tagskill.id
        where tag_tutor.id_teacher = ${id}`);
    },
    add: (entity) => {
        return db.add('rate_and_comment', entity);
    }
}