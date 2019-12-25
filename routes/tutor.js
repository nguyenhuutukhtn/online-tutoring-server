var express = require('express');
var router = express.Router();
const userModel = require('../Model/Users');
const introduceModel = require('../Model/Introduce');
const rateAndCommentModel = require('../Model/RateAndComment.js');
const tagSkillTutorModel = require('../Model/TagTutor');
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

router.post('/updateProfile', passport.authenticate('jwt', { session: false }), (req, res) => {
    let tokens = req.headers.authorization.split(" ")[1];
    var jwtPayload = jwt.verify(tokens, 'your_jwt_secret');
    tagSkillTutorModel.deleteByTutorId(jwtPayload.userId)
        .then(() => {
            let updateIntroduce = introduceModel.updateByIdUser(jwtPayload.userId, req.body.introduce);
            let updateInfo = userModel.updateProfile(req.body.name, req.body.address, jwtPayload.userId);
            let updatePricePerHour = userModel.updatePricePerHour(req.body.pricePerHour, jwtPayload.userId);
            let updateSkill = req.body.listSkill.map(skill => {
                let newSkill = {
                    id_tag: skill,
                    id_teacher: jwtPayload.userId
                };
                return tagSkillTutorModel.add(newSkill);
            });
            Promise.all([...updateSkill, updateInfo, updateIntroduce, updatePricePerHour])
                .then(() => {
                    return res.status(200).json({ message: "update successfully" });
                })
        })
        .catch(err => {
            return res.status(400).json({ error: err });
        })
});

router.get('/list', function (req, res, next) {
    let page = req.query.p || 1;
    let skill = req.query.skill;
    let from = req.query.from || 0;
    let to = req.query.to || Number.MAX_SAFE_INTEGER;
    let limit = 9;
    let offset = limit * (page - 1);
    let listTutor = userModel.allTutor(limit, offset, skill, from, to);
    let countAllTutor = userModel.countAllTutor(skill, from, to);
    Promise.all([countAllTutor, listTutor])
        .then(values => {
            listTutor = values[1].map(tutor => {
                return {
                    id: tutor.id,
                    name: tutor.name,
                    address: tutor.address,
                    avatar: tutor.avatar,
                    pricePerHour: tutor.price_per_hour,
                    avgRate: tutor.avgrate,
                    successfullyRatio: tutor.completePolicy / tutor.totalPolicy * 100
                }
            })
            return res.status(200).json({ count: values[0][0].count, data: listTutor });
        })
        .catch(err => {
            return res.status(500).json({ error: err })
        })
});


router.get('/listOutStanding', function (req, res, next) {
    userModel.getOutStandingTutor()
        .then(tutors => {
            let result = tutors.map(tutor => {
                return {
                    id: tutor.id,
                    name: tutor.name,
                    address: tutor.address,
                    avatar: tutor.avatar,
                    pricePerHour: tutor.price_per_hour,
                    avgRate: tutor.avgrate,
                    successfullyRatio: tutor.completePolicy / tutor.totalPolicy * 100
                }
            })
            return res.status(200).json({ data: result });
        })
        .catch(err => {
            return res.status(500).json({ error: err });
        })
});

router.get('/introduce', function (req, res) {
    let userId = req.query.id;
    introduceModel.findByIdUser(userId)
        .then(introduce => {
            return res.status(200).json({
                data: introduce[0]
            })
        })
        .catch(err => {
            return res.status(500).json({ error: err.toString() })
        })
});

router.get('/listSkill', function (req, res) {
    let userId = req.query.id;
    tagSkillTutorModel.findByTutorId(userId)
        .then(listSkill => {
            return res.status(200).json({
                data: listSkill
            })
        })
        .catch(err => {
            return res.status(500).json({ error: err.toString() })
        })
});


router.get('/policy', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    let tokens = req.headers.authorization.split(" ")[1];
    var jwtPayload = jwt.verify(tokens, 'your_jwt_secret');
    const page = req.query.p || 1;
    const isNew = req.query.isNew || false;
    let limit = 9;
    let offset = limit * (page - 1);
    let listPolicy = policyModel.findPolicyByTutorId(jwtPayload.userId, isNew, limit, offset);
    let countPolicy = policyModel.countPolicyByTutorId(jwtPayload.userId, isNew);
    Promise.all([countPolicy, listPolicy])
        .then(values => {
            return res.status(200).json({ count: values[0][0].count, data: values[1] });
        })
        .catch(err => {
            return res.status(500).json({ error: err })
        })
});


router.post('/uploadAvatar', async function (req, res, next) {
    const avatarUrl = req.body.avatarUrl;
    const id = req.body.id;
    console.log('---------avatarUrl', avatarUrl);
    console.log('---------id', id);
    const userData = await userModel.updateAvatar(id, avatarUrl);
    if (!userData) {
        res.status(400).json({ message: 'update avatar not success' });
    }
    res.status(200).json({ message: 'update data success ' });
});

router.put('/approvePolicy', passport.authenticate('jwt', { session: false }), (req, res) => {
    let tokens = req.headers.authorization.split(" ")[1];
    var jwtPayload = jwt.verify(tokens, 'your_jwt_secret');
    const policyId = req.body.id;
    if (!policyId) {
        res.status(400).json({ message: "Your should pass the id of the policy" })
    }
    policyModel.findPolicyByPolicyId(policyId)
        .then((policy) => {
            if (policy[0].id_teacher !== jwtPayload.userId) {
                return res.status(400).json({ message: "Your can't approve the policy does not belong to you!!!" })
            }
            if (policy[0].status !== "new") {
                return res.status(400).json({ message: "This policy was approved!!!" })
            }
            if (policy[0].payment_status !== "yes") {
                return res.status(400).json({ message: "Unpaid policy can not approve!!!" })
            }
            policyModel.changeStatusByPolicyId(policyId, "approve")
                .then(() => {
                    return res.status(200).json({ message: "approve policy successfully" })
                })
                .catch(err => {
                    return res.status(500).json({ error: err });
                })

        })
})

router.put('/cancelPolicy', passport.authenticate('jwt', { session: false }), (req, res) => {
    let tokens = req.headers.authorization.split(" ")[1];
    var jwtPayload = jwt.verify(tokens, 'your_jwt_secret');
    const policyId = req.body.id;
    if (!policyId) {
        res.status(400).json({ message: "Your should pass the id of the policy" })
    }
    policyModel.findPolicyByPolicyId(policyId)
        .then((policy) => {
            if (policy[0].id_teacher !== jwtPayload.userId) {
                return res.status(400).json({ message: "Your can't cancel the policy does not belong to you!!!" })
            }
            if (policy[0].status !== "new") {
                return res.status(400).json({ message: "This policy can't cancel!!!" })
            }
            policyModel.changeStatusByPolicyId(policyId, "cancel")
                .then(() => {
                    if (policy[0].payment_status === "yes") {
                        userModel.addMoney(policy[0].price * 0.95, policy[0].id_student)
                            .then(() => {
                                return res.status(200).json({ message: "cancel policy successfully" });
                            })
                    }
                    return res.status(200).json({ message: "cancel policy successfully" })
                })
                .catch(err => {
                    return res.status(500).json({ error: err });
                })

        })
})

router.get('/incomeStatistic', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let tokens = req.headers.authorization.split(" ")[1];
    var jwtPayload = jwt.verify(tokens, 'your_jwt_secret');
    const year = (new Date()).getFullYear();
    let listPolicy = await policyModel.findAllPolicyCompleteInOneYearOfTutor(jwtPayload.userId, year);
    let result = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    listPolicy.forEach(e => {
        let month = (new Date(e.complete_date)).getMonth();
        result[month] = result[month] + e.price;
    })
    return res.status(200).json({ data: result })
});


router.get('/policy/:policyId', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    let tokens = req.headers.authorization.split(" ")[1];
    var jwtPayload = jwt.verify(tokens, 'your_jwt_secret');
    let policyId = req.params.policyId;
    policyModel.findPolicyByPolicyId(policyId)
        .then(policy => {
            if (policy[0].id_teacher !== jwtPayload.userId) {
                return res.status(400).json({ message: "You can't get the policy does not belong to you !!!! " })
            }
            return res.status(200).json({ data: policy[0] })
        })
        .catch(err => {
            return res.status(500).json({ error: err.toString() });
        })
});
router.get('/:tutorId', function (req, res, next) {
    let getTutorInfo = userModel.getTutorById(req.params.tutorId);
    let getTutorRateAndComment = rateAndCommentModel.findByTutorId(req.params.tutorId);
    let getTutorIntroduce = introduceModel.findByIdUser(req.params.tutorId);
    let getTutorSkill = tagSkillTutorModel.findByTutorId(req.params.tutorId);
    let getOldStudent = userModel.getOldStudentByTutorId(req.params.tutorId)
    Promise.all([getTutorInfo, getTutorRateAndComment, getTutorIntroduce, getTutorSkill, getOldStudent])
        .then(values => {
            tutorInfo = {
                id: values[0][0].id,
                name: values[0][0].name,
                address: values[0][0].address,
                avatar: values[0][0].avatar,
                pricePerHour: values[0][0].price_per_hour,
                avgRate: values[0][0].avgrate,
                successfullyRatio: values[0][0].completePolicy / values[0][0].totalPolicy * 100
            }
            return res.status(200).json({ info: tutorInfo, rateAndComment: values[1], introduce: values[2], skill: values[3], listOldStudent: values[4] });
        })
        .catch(err => {
            return res.status(500).json({ error: err.toString() })
        })
});


module.exports = router;
