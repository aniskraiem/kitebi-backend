const router = require("express").Router()
const upload = require('../middlewares/audiobooks.storage');
const controller = require("../controllers/audiobook.controller");

router.route("/one/:bookId")
    .get(controller.getwithParams)
    .delete(controller.delete);

router.route("/one")
    .get(controller.get)
    .post(upload.fields([{name: "cover", maxCount: 1,}, {name: "audio", maxCount: 1,}]), controller.add)
    .put(upload.single("picture"),controller.update);

router.post("/toggle-favorite", controller.toggleFavorite)
router.get("/get-favorite/:userId", controller.getFavorite)

router.post("/favoriteAudiobooks/:AudibookId/:userId", controller.addFavAudioBook);
router.put("/favoriteAudiobooksdel/:AudibookId/:userId", controller.RemoveWishItem);

router.get('/favoriteAudiobooks/:userId', controller.getUserInfo)
router.get("/get-categorie", controller.getcategorie)

router.route("/all").get(controller.getAll).delete(controller.deleteAll);

module.exports = router