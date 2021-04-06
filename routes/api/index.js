const router = require("express").Router();
// const userRoutes = require("./users");
const dataRoutes = require("./data");
// const tokenRoutes = require("./tokens")

// // Admin routes
// router.use("/users", userRoutes);
//
// // Token routes
// router.use("/tokens", tokenRoutes);

// Database routes
router.use("/", dataRoutes);

module.exports = router;
