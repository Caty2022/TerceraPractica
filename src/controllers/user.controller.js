const UserModel = require("../models/user.model.js");
const passport = require("passport");
const UserDTO = require("../dto/user.dto.js");
const { generatedResetToken } = require("../utils/tokenreset.js");
const { de_AT } = require("@faker-js/faker");
const EmailManager = require("../service/email.js");
const { isValidPassword, createHash } = require("../utils/hashbcryp.js");
const emailManager = new EmailManager();

class UserController {
  async register(request, response) {
    const { first_name, last_name, email, password, age } = request.body;

    try {
      // Código para registrar usuario
      response.redirect("/products");
    } catch (error) {
      console.log("Error creating the user: ", error);
      response.status(500).send({ error: "Error saving the new user" });
    }
  }

  async login(request, response) {
    // Código para manejar login de usuario
    response.send("Login successful");
  }

  async profile(request, response) {
    const userDTO = new UserDTO(
      request.user.first_name,
      request.user.last_name,
      request.user.role
    );
    const isAdmin = request.user.role === "admin";
    response.render("profile", { user: userDTO, isAdmin });
  }

  async logout(request, response) {
    // Código para manejar logout de usuario
    request.logout();
    response.send("Logout successful");
  }

  async githubAuth(request, response) {
    // Código para manejar autenticación con GitHub
    response.send("GitHub authentication");
  }

  async githubAuthCallback(request, response) {
    // Código para manejar el callback de autenticación con GitHub
    response.send("GitHub authentication callback");
  }

  async admin(request, response) {
    if (request.user.role !== "admin") {
      return response.status(403).send("Denied Access");
    }
    response.render("admin");
  }

  async requestPasswordReset(request, response) {
    const { email } = request.body;

    try {
      const user = await UserModel.findOne({ email });
      if (!user) {
        return response.status(404).send("User Not Found");
      }

      const token = generatedResetToken();

      user.resetToken = {
        token: token,
        expire: new Date(Date.now() + 3600000),
      };

      await user.save();

      await emailManager.sendResetEmail(email, user.first_name, token);

      response.redirect("confirmationsend");
    } catch (error) {
      response.status(500).send("Internal server error");
    }
  }

  async resetPassword(request, response) {
    const { email, password, token } = request.body;

    try {
      const user = await UserModel.findOne({ email });
      if (!user) {
        return response.render("passwordchange", { error: "User Not Found" });
      }

      const resetToken = user.resetToken;
      if (!resetToken || resetToken.token !== token) {
        return response.render("passwordreset", {
          error: "The token for reset the password is invalid",
        });
      }

      const now = new Date();
      if (now > resetToken.expire) {
        return response.render("passwordreset", {
          error: "The token for reset the password is invalid",
        });
      }

      if (isValidPassword(password, user)) {
        return response.render("passwordchange", {
          error: "The new password couldn't be the same that the last one",
        });
      }

      user.password = createHash(password);

      user.resetToken = undefined;
      await user.save();

      return response.redirect("/login");
    } catch (error) {
      response
        .status(500)
        .send("passwordreset", { error: "Internal server error" });
    }
  }

  async changeRolPremium(request, response) {
    const { uid } = request.params;

    try {
      const user = await UserModel.findById(uid);
      if (!user) {
        return response.status(404).send("User Not Found");
      }

      const newRole = user.role === "usuario" ? "premium" : "usuario";

      const update = await UserModel.findByIdAndUpdate(uid, { role: newRole });
      response.json(update);
    } catch (error) {
      response.status(500).send("Internal server error");
    }
  }
}

module.exports = UserController;
