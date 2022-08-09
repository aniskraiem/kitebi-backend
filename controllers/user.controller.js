const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const os = require("os");

// BASIC ROUTES - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

exports.getAll = async (req, res) => {
    return res.send({user: await User.find().select("-password")})
}
exports.getmarkpage = async (req, res) => {
let mark
    try {
        const user = await User.findById(req.params.userid);

          user.Marksheet.map(x=>{
            if(x.idbook==req.params.idbook){
                mark=x;
            }
          })
          res.json(mark);
    } catch (error) {
        console.log(error)
    } 
};

exports.addMarkpage = async (req, res) => {

    try {
        const user = await User.findById(req.params.userid);
let ind=0
        const newMarkPage = {
            idbook: req.body.idbook,
            titre: req.body.titre,
            nbpage: req.body.nbpage,
          };
          user.Marksheet.map((x)=>{
            if(x.idbook==req.body.idbook){
                x.idbook= req.body.idbook,
                x.titre= req.body.titre,
                x.nbpage= req.body.nbpage,
                ind=ind+1
            }
          })
          if(ind==0){
            user.Marksheet.unshift(newMarkPage)
          }

          await user.save();
          res.json(user);
    } catch (error) {
        console.log(error)
    } 
};


exports.get = async (req, res) => {
    try {
        const id = req.params.userId;
        const user = await User.findById({_id: id}).select("-password");
        res.status(200).json({user});
    } catch (err) {
        res.status(500);
    }
};

exports.add = async (req, res) => {
    const {email, password, firstname, lastname, birthdate, gender, pictureId, isVerified, role} = req.body;
    let user = await new User({
        email,
        password: await bcrypt.hash(password, 10),
        firstname,
        lastname,
        birthdate,
        gender,
        pictureId,
        isVerified,
        role,
    }).save();
    return res.send({message: "User added successfully", user});
};

exports.delete = async (req, res) => {
    let user = await User.findById(req.params.userId);
    if (user) {
        await user.remove();
        return res.send({message: "Users" + user._id + " have been deleted"});
    } else {
        return res.status(404).send({message: "User does not exist"});
    }
};

exports.update = async (req, res) => {
    const {email, password, firstname, lastname, birthdate, gender, isVerified, role} = req.body;
    const user = await User.findById({_id: req.params.userId}).select("-password");
    if (user) {
        await user.update({
            $set: {
                email,
                password: await bcrypt.hash(password, 10),
                firstname,
                lastname,
                birthdate,
                gender,
                pictureId: req.files.picture[0].filename,
                isVerified,
                role,
            }
        });
        return res.send({message: "User updated successfully"});
    } else {
        return res.status(404).send({message: "User does not exist"});
    }
};

// AUTH ROUTES - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

exports.register = async (req, res) => {
    let pictureFileName;
    if (req.file) {
        pictureFileName = req.file.filename;
    }

    const {
        email,
        password,
        firstname,
        lastname,
        birthdate,
        gender,
        role,
    } = req.body;

    if (await User.findOne({email}).select("-password")) {
        res.status(403).send({message: "User already exist !"});
    } else {
        let user = await new User({
            email,
            password: await bcrypt.hash(password, 10),
            firstname,
            lastname,
            birthdate,
            gender,
            pictureId: pictureFileName,
            isVerified: true,
            role,
        }).save();

        // token creation
        const token = generateUserToken(user)

        await doSendConfirmationEmail(email, token, req.protocol);

        res.status(200).send({
            message: "success",
            user,
            Token: jwt.verify(token, process.env.JWT_SECRET),
        });
    }
};

exports.login = async (req, res) => {
    const {email, password} = req.body;

    const user = await User.findOne({email});

    if (user) {
        if (await bcrypt.compare(password, user.password)) {

            const token = generateUserToken(user)

            if (!user.isVerified) {
                console.log("User not verified")
                res.status(403).send({user, message: "Email not verified"});
            } else {
                res.status(200).send({token, user, message: "Success"});
            }
        } else {
            res.status(403).send({message: "Password incorrect"});
        }
    } else {
        res.status(403).send({message: "User does not exist"});
    }
};

exports.loginWithSocial = async (req, res) => {
    const {email, firstname, lastname, role} = req.body;

    if (email === "") {
        res.status(403).send({message: "error please provide an email"});
    } else {
        var user = await User.findOne({email}).select("-password");
        if (user) {
            console.log("user exists, loging in");
        } else {
            console.log("user does not exists, creating an account");

            user = await new User({
                email,
                firstname,
                lastname,
                isVerified: true,
                role,
            }).save();
        }

        // token creation
        const token = generateUserToken(user)

        res.status(201).send({message: "success", user, token: token});
    }
};

exports.sendConfirmationEmail = async (req, res) => {

    const user = await User.findOne({email: req.body.email}).select("-password");

    if (user) {
        token = generateUserToken(user);

        await doSendConfirmationEmail(req.body.email, token, req.protocol);

        res.status(200).send({
            message: "L'email de confirmation a été envoyé a " + user.email,
        });
    } else {
        res.status(404).send({message: "User innexistant"});
    }
};

exports.confirmation = async (req, res) => {
    if (req.params.token) {
        try {
            token = jwt.verify(req.params.token, process.env.JWT_SECRET);
        } catch (e) {
            return res.render("confirmation.twig", {
                message:
                    "The verification link may have expired, please resend the email.",
            });
        }
    } else {
        return res.render("confirmation.twig", {
            message: "no token",
        });
    }

    User.findById(token.user._id, function (err, user) {
        if (!user) {
            return res.render("confirmation.twig", {
                message: "User does not exist, please register.",
            });
        } else if (user.isVerified) {
            return res.render("confirmation.twig", {
                message: "This user has already been verified, please login",
            });
        } else {
            user.isVerified = true;
            user.save(function (err) {
                if (err) {
                    return res.render("confirmation.twig", {
                        message: err.message,
                    });
                } else {
                    return res.render("confirmation.twig", {
                        message: "Your account has been verified",
                    });
                }
            });
        }
    }).select("-password");
};

exports.forgotPassword = async (req, res) => {
    const user = await User.findOne({email: req.body.email}).select("-password");

    if (user) {
        const randomNumber = randomIntBetween(1000, 9999);

        // token creation
        const token = await generateResetToken(randomNumber)

        const success = await sendEmail({
            from: process.env.GMAIL_USER,
            to: req.body.email,
            subject: "Password reset - Kitebi",
            html:
                "<h3>You have requested to reset your password</h3><p>Your reset code is : <b style='color : #7b2bf1'>" +
                randomNumber +
                "</b></p>",
        }).catch((error) => {
            console.log(error)
            return res.status(500).send({
                message: "Error : email could not be sent"
            })
        });

        if (success) {
            return res.status(200).send({
                message: "Reset email has been sent to : " + user.email, token
            })
        } else {
            return res.status(500).send({
                message: "Email could not be sent"
            })
        }
    } else {
        return res.status(404).send({message: "User does not exist"});
    }
};

exports.verifyResetCode = async (req, res) => {
    let openToken
    try {
        openToken = jwt.verify(req.body.token, process.env.JWT_SECRET);
    } catch (e) {
        console.log(e)
        return res.status(500).send({message: "Error, could not decrypt token"});
    }

    if (String(openToken.resetCode) === req.body.typedResetCode) {
        res.status(200).send({message: "Success"});
    } else {
        res.status(403).send({message: "Incorrect reset code"});
    }
}

exports.resetPassword = async (req, res) => {
    const {
        email,
        password,
    } = req.body;

    try {
        await User.findOneAndUpdate({email},
            {
                $set: {
                    password: await bcrypt.hash(password, 10),
                },
            }
        )
        res.status(200).send({message: "Success"});
    } catch (error) {
        res.status(500).send({error});
    }
}

exports.updateProfile = async (req, res) => {

    console.log(req.body);

    const {
        email,
        firstname,
        lastname,
        birthdate,
        gender,
        region,
        bio,
        city
    } = req.body;

    await User.findOneAndUpdate({_id: req.params.userId},
        {
            $set: {
                email,
                firstname,
                lastname,
                birthdate,
                gender,
                region,
                bio,
                city
            },
        }
    )

    return res.send({
        message: "Password updated successfully",
        user: await User.findById(req.params.userId).select("-password")
    });
};

exports.updateProfilePic = async (req, res) => {
    let {_id} = req.body;

    const id = req.params.userId;

    if (id != null) {
        _id = id
    }

    await User.findOneAndUpdate(
        {_id},
        {
            $set: {pictureId: req.file.filename},
        }
    );

    return res.send({message: "Picture updated successfully", user: await User.findById(id)});

};

exports.updatePassword = async (req, res) => {
    console.log("ppp")
    const {
        password
    } = req.body;

    await User.findOneAndUpdate({_id: req.params.userId},
        {
            $set: {
                password: await bcrypt.hash(password, 10),
            },
        }
    );

    return res.send({message: "Password updated successfully"});

};

// UTILITIES FUNCTIONS - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function generateUserToken(user) {
    return jwt.sign({user}, process.env.JWT_SECRET, {
        expiresIn: "100000000", // in Milliseconds (3600000 = 1 hour)
    })
}

function generateResetToken(resetCode) {
    return jwt.sign(
        {resetCode},
        process.env.JWT_SECRET, {
            expiresIn: "100000000", // in Milliseconds (3600000 = 1 hour)
        })
}

async function doSendConfirmationEmail(email, token, protocol) {
    let port = process.env.PORT || 5000

    sendEmail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Confirm your email",
        html:
            "<h3>Please confirm your email using this </h3><a href='" +
            protocol + "://" + os.hostname() + ":" + port + "/auth/confirmation/" + token +
            "'>Link</a>",
    })
}

async function sendEmail(mailOptions) {
    let transporter = await nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASSWORD,
        },
    });

    await transporter.verify(function (error) {
        if (error) {
            console.log(error);
            console.log("Server not ready");
            success = false
        } else {
            console.log("Server is ready to take our messages");
        }
    })

    await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            return false;
        } else {
            console.log("Email sent: " + info.response);
            return true;
        }
    });

    return true
}


function randomIntBetween(min, max) {
    return Math.floor(
        Math.random() * (max - min + 1) + min
    )
}
