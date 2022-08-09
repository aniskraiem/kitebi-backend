const upload = require('../middlewares/posts.storage');
const router = require("express").Router()
const controller = require("../controllers/post.controller");

router.route("/")
    // Get all posts
    .get(controller.getAll)
    // Add a post
    .post(
        upload.fields(
            [
                {name: "file", maxCount: 1},
                {name: "audio", maxCount: 1},
            ],
        ),
        controller.add
    );

// Add a post with only image
router.post("/image", upload.single('file'), controller.addOnlyImage);

// Add a post with only audio
router.post("/audio", upload.single('file'), controller.addOnlyAudio);

// (Get/Update/Delete) post by id
router.route("/:id")
    .get(controller.get)
    .put(controller.update)
    .delete(controller.delete);

// Like/Dislike a post
router.put("/:id/like", controller.like)

// Get timeline posts
router.get("/timeline/:userId", controller.getAll);

// Get user's all posts
router.get("/profile/:userId", controller.getByUser);

////////// MOBILE ///////////////////////////////////

// Like / Dislike a post
router.post("/like", controller.likeMobile)

// Get posts with populated user
router.get("/populated/all", controller.getAllPopulated)

// Get user posts with populated user
router.get("/populated/user=:userId", controller.getAllPopulatedByUser)

//get /Post Comment

router.route("/comment/:id")
    .post(controller.addcomment)
    .get(controller.getAllComment);
//deleteComment
router.route("/comment/:id/:comment_id")
    .delete(controller.deleteComment)
    .put(controller.EditComment)
module.exports = router;
