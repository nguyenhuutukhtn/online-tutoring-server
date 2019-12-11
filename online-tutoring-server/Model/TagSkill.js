let db = require('../utils/db');

module.exports = {
    allTagSkill: () => {
        return db.load('select * from tagskill');
    },
}