const router = require("express").Router()
const path = require("path");

router.get("/privacy-policy", function (req, res) {
    res.sendFile(
        path.resolve(__dirname) + "/views/privacy-policy.html"
    );
});

router.get("/user-agreements", function (req, res) {
    res.sendFile(
        path.resolve(__dirname) + "/views/user-agreements.html"
    );
});

router.get("/help", function (req, res) {
    res.sendFile(
        path.resolve(__dirname) + "/views/help.html"
    );
});

module.exports = router
