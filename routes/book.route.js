const router = require("express").Router()
const upload = require('../middlewares/books.storage');
const controller = require("../controllers/book.controller");

router.route("/one/:bookId")
    .get(controller.get)
    .delete(controller.delete);

router.route("/one")
    .get(controller.get)
    .post(upload.fields([{name: "cover", maxCount: 1,}, {name: "pdf", maxCount: 1,},]), controller.add)
    .put(upload.single("picture"), controller.update);
router.post("/toggle-favorite", controller.toggleFavorite)
router.get("/get-favorite/:userId", controller.getFavorite)

router.post("/favoriteBooks/:bookId/:userId", controller.addFavBook);
router.put("/favoriteBooksdel/:bookId/:userId", controller.RemoveWishItem);
router.get("/get-categorie", controller.getcategorie)

router.get('/favoriteBooks/:userId', controller.getUserInfo);

router.route("/all").get(controller.getAll).delete(controller.deleteAll);

module.exports = router