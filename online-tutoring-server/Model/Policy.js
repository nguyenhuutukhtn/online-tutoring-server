let db = require('../utils/db');

module.exports = {
    findPolicyByTutorId: (id) => {
        let sql = `select P.status, P.register_date,P.price, P.hours_hire,P.payment_status, U.name
        from policy P join user U on P.id_student = U.id
        where id_teacher = ${id}`;
        console.log('----poli', sql);
        return db.load(sql);
    },
    add: (entity) => {
        return db.add('policy', entity);
    }
}