let db = require('../utils/db');

module.exports = {
    findPolicyByTutorId: (id) => {
        let sql = `select P.id, P.status, P.register_date,P.price, P.hours_hire,P.payment_status, U.name
        from policy P join user U on P.id_student = U.id
        where id_teacher = ${id}`;
        console.log('----poli', sql);
        return db.load(sql);
    },
    findPolicyByStudentId: (id) => {
        let sql = `select P.id, P.status, P.register_date,P.price, P.hours_hire,P.payment_status, U.name
        from policy P join user U on P.id_teacher = U.id
        where id_student = ${id}`;
        console.log('----poli', sql);
        return db.load(sql);
    },
    add: (entity) => {
        return db.add('policy', entity);
    },
    findPolicyByPolicyId: (id) => {
        let sql = `select P.*,U1.name as student_name, U2.name as tutor_name
        from policy P join user U1 on P.id_student = U1.id join user U2 on P.id_teacher = U2.id
        where P.id = ${id}`;
        return db.load(sql);
    },
    changeStatusByPolicyId: (id, newStatus) => {
        let sql = `update policy set status = "${newStatus}" where id = ${id}`;
        return db.load(sql);
    },
    changePaymentStatusByPolicyId: (id, newStatus) => {
        let sql = `update policy set payment_status = "${newStatus}" where id = ${id}`;
        return db.load(sql);
    }
}