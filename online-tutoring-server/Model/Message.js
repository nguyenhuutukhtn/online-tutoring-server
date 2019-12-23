let db = require('../utils/db');

module.exports = {
  getAllMessageById: (idStudent, idTutor) => {
      return db.load(`select * from message where (idSender=${idStudent} or idReceiver=${idStudent}) and (idSender=${idTutor} or idReceiver=${idTutor}) order by time`)
  },
  add: (entity) => {
    return db.add('message', entity);
  },
  getAllMessage: (id) => {
    return db.load(`select * from message where idSender=${id} or idReceiver=${id} order by time`)
  }
}
