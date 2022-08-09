const router = require("express").Router()
const upload = require('../middlewares/user.storage');
const controller = require("../controllers/user.controller");

router.route("/").get(controller.getAll);
router.route("/markpage/:userid/:idbook")
.get(controller.getmarkpage);
router.route("/markpage/:userid")
    .post(controller.addMarkpage);

router.route("/one/:userId")
    .get(controller.get)
    .post(controller.add)
    .delete(controller.delete)
    .put(upload.fields([{name: "picture", maxCount: 1,}]), controller.update);

// AUTH FUNCTIONS
router.post("/register", upload.single('picture'), controller.register);
router.post("/login", controller.login);
router.post("/login-with-social", controller.loginWithSocial);

// EMAIL FUNCTIONS
router.post("/send-confirmation-email", controller.sendConfirmationEmail);
router.get("/confirmation/:token", controller.confirmation);

// FORGOT PASSWORD
router.post("/forgot-password", controller.forgotPassword);
router.post("/verify-reset-code", controller.verifyResetCode);
router.post("/reset-password", controller.resetPassword);

// USER UPDATE
router.put("/update-profile/:userId", controller.updateProfile);
router.put("/update-picture/:userId", upload.single("picture"), controller.updateProfilePic);
router.put("/update-password/:userId", controller.updatePassword);

module.exports = router