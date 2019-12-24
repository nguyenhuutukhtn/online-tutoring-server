var express = require('express');
var router = express.Router();
const skillModel = require('../Model/TagSkill');

/* GET home page. */
router.get('/', function (req, res, next) {
    skillModel.allTagSkill()
        .then(result => {
            res.status(200).json({ data: result });
        })
        .catch(err => {
            res.status(400).json({ error: err });
        })
});

module.exports = router;
