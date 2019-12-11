let db = require('../utils/db');

module.exports = {
    findByTutorId: (id) => {
        return db.load(`SELECT tag_tutor.*, tagskill.name FROM tag_tutor
        join tagskill on tag_tutor.id_tag = tagskill.id
        where tag_tutor.id_teacher = ${id}`);
    },
    add: (entity) => {
        return db.add('tag_tutor', entity);
    },
    delete: (idTag, idTutor) => {
        return db.load(`delete from tag_tutor where id_tag = ${idTag} and id_teacher = ${idTutor}`);
    },
    deleteByTutorId: (id) => {
        return db.load(`delete from tag_tutor where id_teacher = ${id}`);
    }
}