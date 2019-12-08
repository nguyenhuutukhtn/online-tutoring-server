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
    allTutor: () => {
        return db.load(`select * from user`);
    }
}