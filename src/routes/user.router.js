const express = require("express");
const router = express.Router();
const passport = require("passport");
const UserController = require("../controllers/user.controller.js");

const userController = new UserController();

// Registro
router.post("/register", userController.register);

// Autenticación
router.post("/login", userController.login);
router.post("/logout", userController.logout);

// Perfil de usuario (protegido por JWT)
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  userController.profile
);

// GitHub Auth
router.get("/auth/github", userController.githubAuth);
router.get("/auth/github/callback", userController.githubAuthCallback);

// Admin (protegido por JWT)
router.get(
  "/admin",
  passport.authenticate("jwt", { session: false }),
  userController.admin
);

// Restablecimiento de contraseña
router.post("/requestPasswordReset", userController.requestPasswordReset);
router.post("/reset-password", userController.resetPassword);
router.put("/premium/:uid", userController.changeRolPremium);

module.exports = router;
