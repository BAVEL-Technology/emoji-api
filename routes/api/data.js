const router = require("express").Router();
const dataController = require("../../controllers/dataController");

//List all emojis
//Query string parameters include: skin-tone, limit, offset, sort
// router.route("/")
//   .get(dataController.all)

//Search all emojis
//Query string parameters include: skin-tone, limit, offset, sort, query
// router.route("/search")
//   .get(dataController.search)

//Find one emoji by name
//Query string parameters include: skin-tone
router.route("/:emoji")
  .get(dataController.find)

//List all categories
// router.route("/categories")
//   .get(dataController.categories)

//Find one emojis inside category
//Query string parameters include: skin-tone, limit, offset, sort
// router.route("/categories/:category")
//   .get(dataController.category)

module.exports = router;
