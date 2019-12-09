var express = require('express');
var router = express.Router();
const userModel = require('../Model/Users');
const introduceModel = require('../Model/Introduce');
const rateAndCommentModel = require('../Model/RateAndComment.js');
const tagSkillModel = require('../Model/TagSkill');
const policyModel = require('../Model/Policy')
const jwt = require('jsonwebtoken');
const passport = require('passport');

/* GET home page. */
router.post('/updateIntroduce', passport.authenticate('jwt', { session: false }), function (req, res, next) {

    let tokens = req.headers.authorization.split(" ")[1];
    var jwtPayload = jwt.verify(tokens, 'your_jwt_secret');
    introduceModel.findByIdUser(jwtPayload.userId)
        .then(introduce => {
            if (introduce.length === 0) {
                let newIntroduce = {
                    id_user: jwtPayload.userId,
                    content: req.body.content
                };
                introduceModel.add(newIntroduce);
                return res.status(200).json({
                    message: "update successfully",
                });
            }
            introduceModel.updateByIdUser(jwtPayload.userId, req.body.content)
                .then(() => {
                    return res.status(200).json({
                        message: "update successfully",
                    });
                })
        })

});
router.get('/list', function (req, res, next) {
    let page = req.query.p || 1;
    let limit = 10;
    let offset = limit * (page - 1);
    let listTutor = userModel.allTutor(limit, offset);
    let countAllTutor = userModel.countAllTutor();
    Promise.all([countAllTutor, listTutor])
        .then(values => {
            return res.status(200).json({ count: values[0][0].count, data: values[1] });
        })
        .catch(err => {
            return res.status(500).json({ error: err })
        })
});
router.get('/policy', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    let tokens = req.headers.authorization.split(" ")[1];
    var jwtPayload = jwt.verify(tokens, 'your_jwt_secret');
    policyModel.findPolicyByTutorId(jwtPayload.userId)
        .then((policys => {
            return res.status(200).json({ data: policys });
        }))
        .catch(err => {
            return res.status(400).json({ error: err });
        })
});

router.get('/:tutorId', function (req, res, next) {
    let getTutorInfo = userModel.getTutorById(req.params.tutorId);
    let getTutorRateAndComment = rateAndCommentModel.findByIdTutor(req.params.tutorId);
    let getTutorIntroduce = introduceModel.findByIdUser(req.params.tutorId);
    let getTutorSkill = tagSkillModel.findByIdTutor(req.params.tutorId);
    let getOldStudent = userModel.getOldStudentByTutorId(req.params.tutorId)
    Promise.all([getTutorInfo, getTutorRateAndComment, getTutorIntroduce, getTutorSkill, getOldStudent])
        .then(values => {
            return res.status(200).json({ info: values[0], rateAndComment: values[1], introduce: values[2], skill: values[3], listOldStudent: values[4] });
        })
        .catch(err => {
            return res.status(500).json({ error: err })
        })
});



module.exports = router;