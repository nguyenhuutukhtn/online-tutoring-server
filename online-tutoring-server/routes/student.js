var express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const moment = require('moment');

const userModel = require('../Model/Users');
const policyModel = require('../Model/Policy');
const rateAndCommentModel = require('../Model/RateAndComment');


var router = express.Router();

/* GET home page. */
router.post('/register', passport.authenticate('jwt', { session: false }), (req, res, ) => {
    let tokens = req.headers.authorization.split(" ")[1];
    var jwtPayload = jwt.verify(tokens, 'your_jwt_secret');
    let id_teacher = req.body.id_teacher;
    let id_student = jwtPayload.userId;
    let hours_hire = req.body.hours_hire;
    let register_date = new Date();
    let price;
    userModel.singleById(id_teacher)
        .then(teacher => {
            if (teacher.length === 0) {
                return res.status(400).json({
                    message: "Tutor is not exist"
                });
            }
            price = teacher[0].price_per_hour * hours_hire;
            let newPolicy = {
                id_teacher,
                id_student,
                hours_hire,
                register_date,
                price
            }
            policyModel.add(newPolicy)
                .then(() => {
                    return res.status(200).json({ message: "register with tutor successfully" });
                })
                .catch(err => {
                    return res.status(400).json({ error: err });
                })
        })
});

router.get('/policy', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    let tokens = req.headers.authorization.split(" ")[1];
    var jwtPayload = jwt.verify(tokens, 'your_jwt_secret');
    policyModel.findPolicyByStudentId(jwtPayload.userId)
        .then((policys => {
            return res.status(200).json({ data: policys });
        }))
        .catch(err => {
            return res.status(400).json({ error: err });
        })
});

router.put('/completePolicy', passport.authenticate('jwt', { session: false }), (req, res) => {
    let tokens = req.headers.authorization.split(" ")[1];
    var jwtPayload = jwt.verify(tokens, 'your_jwt_secret');
    const policyId = req.body.id;
    if (!policyId) {
        res.status(400).json({ message: "Your should pass the id of the policy" })
    }
    policyModel.findPolicyByPolicyId(policyId)
        .then((policy) => {
            if (policy[0].id_student !== jwtPayload.userId) {
                return res.status(400).json({ message: "Your can't approve the policy does not belong to you!!!" })
            }
            if (policy[0].status !== "approve") {
                return res.status(400).json({ message: "This policy can't complete!!!" })
            }
            policyModel.changeStatusByPolicyId(policyId, "complete")
                .then(() => {
                    return res.status(200).json({ message: "complete policy successfully" })
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
            if (policy[0].id_student !== jwtPayload.userId) {
                return res.status(400).json({ message: "Your can't cancel the policy does not belong to you!!!" })
            }
            if (policy[0].status !== "approve") {
                return res.status(400).json({ message: "This policy can't cancel!!!" })
            }
            policyModel.changeStatusByPolicyId(policyId, "cancel")
                .then(() => {
                    return res.status(200).json({ message: "cancel policy successfully" })
                })
                .catch(err => {
                    return res.status(500).json({ error: err });
                })

        })
})

router.put('/payPolicy', passport.authenticate('jwt', { session: false }), (req, res) => {
    let tokens = req.headers.authorization.split(" ")[1];
    var jwtPayload = jwt.verify(tokens, 'your_jwt_secret');
    const policyId = req.body.id;
    if (!policyId) {
        res.status(400).json({ message: "Your should pass the id of the policy" })
    }
    policyModel.findPolicyByPolicyId(policyId)
        .then((policy) => {
            if (policy[0].id_student !== jwtPayload.userId) {
                return res.status(400).json({ message: "Your can't pay the policy does not belong to you!!!" })
            }
            if (policy[0].payment_status !== "no") {
                return res.status(400).json({ message: "This policy was paid!!!" })
            }
            policyModel.changePaymentStatusByPolicyId(policyId, "yes")
                .then(() => {
                    return res.status(200).json({ message: "pay policy successfully" })
                })
                .catch(err => {
                    return res.status(500).json({ error: err });
                })
        })
})

router.get('/policy/:policyId', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    let tokens = req.headers.authorization.split(" ")[1];
    var jwtPayload = jwt.verify(tokens, 'your_jwt_secret');
    let policyId = req.params.policyId;
    policyModel.findPolicyByPolicyId(policyId)
        .then(policy => {
            if (policy[0].id_student !== jwtPayload.userId) {
                return res.status(400).json({ message: "You can't get the policy does not belong to you !!!! " })
            }
            return res.status(200).json({ data: policy[0] })
        })
        .catch(err => {
            return res.status(500).json({ error: err.toString() });
        })
});

router.post('/rateAndComment', passport.authenticate('jwt', { session: false }), (req, res) => {
    let tokens = req.headers.authorization.split(" ")[1];
    var jwtPayload = jwt.verify(tokens, 'your_jwt_secret');
    let rate = req.body.rate;
    let id_teacher = req.body.id;
    let comment = req.body.comment;
    let date = new Date();
    rateAndCommentModel.add({
        id_student: jwtPayload.userId,
        id_teacher,
        rate,
        comment,
        date
    })
        .then(() => {
            res.status(200).json({ message: "Rate and comment successfully" })
        })
        .catch(err => {
            res.status(500).json({ error: err.toString() });
        })

})

module.exports = router;