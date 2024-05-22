const express = require("express");
const router = express.Router();
const ViewsController = require("../controllers/view.controller.js");
const viewsController = new ViewsController();
const checkUserRole = require("../middleware/checkrole.js");
const passport = require("passport");

router.get("/", viewsController.renderHome);
router.get("/login", viewsController.renderLogin);
router.get("/register", viewsController.renderRegister);

// Agregamos el middleware checkUserRole y passport.authenticate
router.get(
  "/products",
  checkUserRole(["usuario"]),
  passport.authenticate("jwt", { session: false }),
  viewsController.renderProducts
);

router.get("/carts/:cid", viewsController.renderCart);

// Agregamos el middleware checkUserRole
router.get("/chat", checkUserRole(["usuario"]), viewsController.renderChat);

// Agregamos el middleware checkUserRole
router.get(
  "/realtimeproducts",
  checkUserRole(["admin"]),
  viewsController.renderRealTimeProducts
);

module.exports = router;
