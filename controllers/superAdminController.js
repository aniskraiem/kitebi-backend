const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const authsuper = require('../middlewares/authsuper');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult} = require('express-validator');
const User = require("../models/user");
const SuperAdmin = require('../models/SuperAdmin');
const Book = require('../models/book');
const Audiobook = require('../models/audiobook');

// @route    GET api/auth
// @desc     Get user by token
// @access   Private
router.get('/', authsuper, async (req, res) => {
    try {
        const user = await SuperAdmin.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/lastbooks',authsuper, async (req, res) => {
    try {
       let datenow=Date.now()
        const books = await Book.find({
            createdAt: {
                $gte: new Date(datenow- 1000 * 60 * 60*24*21),
                $lt: new Date(datenow)
            }
        })
        res.json(books.length);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.get('/lastAudioBook', authsuper,async (req, res) => {
    try {
       let datenow=Date.now()
        const audiob = await Audiobook.find({
            createdAt: {
                $gte: new Date(datenow- 1000 * 60 * 60*24*21),
                $lt: new Date(datenow)
            }
        })
        res.json(audiob.length);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.get('/lastuser', authsuper,async (req, res) => {
    try {
       let datenow=Date.now()
        const user = await User.find({
            createdAt: {
                $gte: new Date(datenow- 1000 * 60 * 60*24*21),
                $lt: new Date(datenow)
            }
        })
        res.json(user.length);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.get('/lastAdmin', authsuper,async (req, res) => {
    try {
       let datenow=Date.now()
        const user = await SuperAdmin.find({
            createdAt: {
                $gte: new Date(datenow- 1000 * 60 * 60*24*21),
                $lt: new Date(datenow)
            }
        })
        res.json(user.length);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


// @route    GET superadmin/get-all-admin
// @desc     Get all user
// @access   Private
router.get('/get-all-admin', authsuper, async (req, res) => {
    try {
        const user = await SuperAdmin.find().select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    delete superadmin/:id
// @desc     delete user
// @access   Private
router.delete('/:id', authsuper, async (req, res) => {
    try {
        const user = await SuperAdmin.findById(req.params.id);
        await user.remove();
        const users = await SuperAdmin.find();
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    GET api/login
// @desc     Get user by token
// @access   Private
router.post(
    '/',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const {email, password} = req.body;

        try {
            let user = await SuperAdmin.findOne({email});

            if (!user) {
                return res
                    .status(400)
                    .json({errors: [{msg: 'Invalid Credentials'}]});
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res
                    .status(400)
                    .json({errors: [{msg: 'Invalid Credentials'}]});
            }

            const payload = {
                user: {
                    id: user.id,
                },
            };

            jwt.sign(
                payload,
                config.get('jwtSecret'),
                // { expiresIn: 36000000 },
                (err, token) => {
                    if (err) throw err;
                    res.json({token});
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

router.put('/', authsuper, async (req, res) => {
    try {
        const me = await SuperAdmin.findById(req.user.id);
        const isMatch = await bcrypt.compare(req.body.oldpassword, me.password);

        if (isMatch) {
            const salt = await bcrypt.genSalt(10);
            const password = await bcrypt.hash(req.body.password, salt);
            await SuperAdmin.findByIdAndUpdate({_id: req.user.id}, {password: password}, {new: true});
            return res.status(200).json("Password Changed")
        } else
            return res.status(400).json({errors: [{msg: 'Password Incorrect'}]});

    } catch (err) {

        res.status(500).send('Server Error');
    }
});

router.post(
    '/add_user',
    [
        check('firstname', 'firstname is required')
            .not()
            .isEmpty(),
        check('lastname', 'lastname is required')
            .not()
            .isEmpty(),

        check('email', 'Please include a valid email').isEmail(),
        check(
            'password',
            'Please enter a password with 6 or more characters'
        ).isLength({min: 6}),
        check('numlib', 'Num library is required')
            .not()
            .isEmpty(),
        check('typeuser', 'Type user is required')
            .not()
            .isEmpty(),

    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        const {
            firstname,
            lastname,
            email,
            numlib,
            password,
            typeuser
        } = req.body;
        try {
            let user = await SuperAdmin.findOne({email});
            if (user) {
                return res
                    .status(400)
                    .json({errors: [{msg: 'Useral ready exists'}]});
            }
            user = new SuperAdmin({
                firstname,
                lastname,
                email,
                numlib,
                password,
                typeuser
            });
            const salt = await bcrypt.genSalt(10);

            user.password = await bcrypt.hash(password, salt);
            await user.save();
            res.status(200).send('User Added');
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

router.get('/stat/', async (req, res) => {

    try {

        // try {
        //   const Male =await  User.aggregate([
        //     {$group : {_id:"$gender", count:{$sum:1}}}
        //   ])
        //   res.json(Male)

        const Male = await User.find({gender: 'Male'}).count()
        const Female = await User.find({gender: 'Female'}).count()

        res.json({Male, Female})

    } catch (error) {
        res.json(error)
    }
})

module.exports = router;