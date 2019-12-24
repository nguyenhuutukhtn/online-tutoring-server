let db = require('../utils/db');

module.exports = {
    findByIdUser: (id) => {
        return db.load(`select * from introduce where id_user=${id}`);
    },
    add: (entity) => {
        return db.add('introduce', entity);
    },
    updateByIdUser: (id, content) => {
        return db.load(`update introduce set content = "${content}" where id_user=${id}`)
    }
}