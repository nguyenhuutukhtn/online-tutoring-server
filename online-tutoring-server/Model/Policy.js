let db = require('../utils/db');

module.exports = {
    findPolicyByTutorId: (id, isNew, limit, offset) => {
        let whereCondition = `where id_teacher = ${id} `;
        if (isNew) {
            whereCondition = whereCondition.concat('and P.status="new"');
        }
        let sql = `select P.id, P.status, P.register_date,P.price, P.hours_hire,P.payment_status, U.name, U.avatar as student_avatar
        from policy P join user U on P.id_student = U.id
        ${whereCondition}`;
        if (limit !== 0) {
            sql = sql + ` limit ${limit}`
        }
        if (offset !== 0) {
            sql = sql + ` offset ${offset}`
        }
        console.log('----poli', sql);
        return db.load(sql);
    },
    countPolicyByTutorId: (id, isNew) => {
        let whereCondition = `where id_teacher = ${id} `;
        if (isNew) {
            whereCondition = whereCondition.concat('and P.status="new"');
        }
        let sql = `select count(*) as count
        from policy P join user U on P.id_student = U.id
        ${whereCondition}`;
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
        let sql = `select P.*,U1.name as student_name, U2.name as tutor_name, U1.address as student_address, U2.address as tutor_address, U1.avatar as student_avatar, U2.avatar as tutor_avatar
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