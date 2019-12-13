let db = require('../utils/db');

module.exports = {
    add: (entity) => {
        return db.add('user', entity);
    },
    singleById: (id) => {
        return db.load(`select * from user where id=${id}`)
    },
    findByEmail: email => {
        return db.load(`select * from user where email="${email}"`);
    },
    findByFaceBookId: fbId => {
        return db.load(`select * from user where facebookId="${fbId}"`);
    },
    findByGoogleId: googleId => {
        return db.load(`select * from user where googleId="${googleId}"`);
    },
    findOne: (email, password) => {
        return db.load(`select * from user where email="${email}" and password="${password}"`);
    },
    updateProfile: (name, address, id) => {
        return db.load(`update user set name = "${name}", address = "${address}" where id = ${id} `);
    },
    updatePricePerHour: (price, id) => {
        return db.load(`update user set price_per_hour = "${price}" where id = ${id} `);
    },
    changePassword: (id, newPassword) => {
        let sql = `update user set password = "${newPassword}" where id = ${id}`;
        return db.load(sql);
    },
    allTutor: (limit, offset, listSkill, from, to) => {
        let whereCondition = "";
        if (listSkill) {
            whereCondition = ` Where tag_tutor.id_tag in (${listSkill})`;
        }
        let sql = `select Temp2.*
        from tag_tutor RIGHT JOIN
        (select Temp.id,Temp.name, Temp.address,Temp.avatar, Temp.price_per_hour, Temp.avgrate, count(policy.id) as totalPolicy, count(case policy.status when 'complete' then 1 else null end) as completePolicy
                from  policy
                Right Join
                (SELECT user.*, AVG(rate_and_comment.rate) as avgrate
                FROM user
                LEFT JOIN rate_and_comment
                ON user.id = rate_and_comment.id_teacher
                where user.role = "tutor" and price_per_hour >= ${from} and price_per_hour<=${to}
                GROUP BY id) Temp on policy.id_teacher = Temp.id
                GROUP BY Temp.id, policy.id_teacher) Temp2 on Temp2.id = tag_tutor.id_teacher
                ${whereCondition}
        GROUP BY Temp2.id
        `;

        if (limit !== 0) {
            sql = sql + ` limit ${limit}`
        }
        if (offset !== 0) {
            sql = sql + ` offset ${offset}`
        }

        return db.load(sql);
    },
    countAllTutor: (skill, from, to) => {
        let whereCondition = "";
        if (skill) {
            whereCondition = ` Where tag_tutor.id_tag in (${skill})`;
        }
        let sql = `select count(*) as count
        from
        (select temp.id
            from tag_tutor right join
                (select *
                    from user 
            where role = "tutor" and price_per_hour >=  ${from} and price_per_hour <= ${to} ) temp on temp.id = tag_tutor.id_teacher
        ${whereCondition}
        group by temp.id) temp2`
        console.log('----sqlcount', sql);
        return db.load(sql);
    },

    getTutorById: (id) => {
        let sql = `select Temp.id,Temp.name, Temp.address,Temp.avatar, Temp.price_per_hour, Temp.avgrate, count(policy.id) as totalPolicy, count(case policy.status when 'complete' then 1 else null end) as completePolicy
        from  policy
        Right Join
        (SELECT user.*, AVG(rate_and_comment.rate) as avgrate
        FROM user
        LEFT JOIN rate_and_comment
        ON user.id = rate_and_comment.id_teacher
        where user.role = "tutor" and user.id = ${id}
        GROUP BY id) Temp on policy.id_teacher = Temp.id
        GROUP BY Temp.id, policy.id_teacher`;
        return db.load(sql);
    },
    getOldStudentByTutorId: (id) => {
        let sql = `select user.name,policy.status,policy.hours_hire, policy.price, policy.complete_date
        from policy join user on policy.id_student = user.id
        where policy.id_teacher = ${id}`;
        return db.load(sql);
    },
    updateAvatar: (id, avatarUrl) => {
        return db.load(`update user set avatar='${avatarUrl}' where id=${id} `)
    },
}
