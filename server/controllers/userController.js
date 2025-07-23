require("dotenv").config();
const { User } = require("../models");
const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");

module.exports = class UserController {
  static async googleLogin(req, res, next) {
    const { id_token } = req.body;
    try {
      const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: process.env.CLIENT_ID,
      });
      const { name, email } = ticket.getPayload();

      let user = await User.findOne({ where: { email } });
      if (!user) {
        user = await User.create({
          name,
          email,
          password: Math.random().toString(36).slice(-8),
        });
      }

      const access_token = signToken({ id: user.id });
      res.status(200).json({ message: "Login Success", access_token });
    } catch (err) {
      console.log(err, "<-------");
      res.status(500).json({ message: "Internal Server Error" });
      //   next(err);
    }
  }

  static async register(req, res, next) {
    try {
      const user = await User.create(req.body);
      res.status(201).json({
        id: user.id,
        email: user.email,
        genre: user.genre,
      });
    } catch (err) {
      console.log("------------->", err);
      if (
        err.name === "SequelizeValidationError" ||
        err.name === "SequelizeUniqueConstraintError"
      ) {
        res.status(400).json({
          message: err.errors[0].message,
        });
      } else {
        res.status(500).json({
          message: "Internal server error",
        });
      }
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email) {
        throw { name: "BadRequest", message: "Email is required" };
      }

      if (!password) {
        throw { name: "BadRequest", message: "Password is required" };
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        throw {
          name: "Unauthorized",
          message: "Error invalid username or email or password",
        };
      }

      const validPassword = comparePassword(password, user.password);
      if (!validPassword) {
        throw {
          name: "Unauthorized",
          message: "Error invalid username or email or password",
        };
      }

      const access_token = signToken({ id: user.id });
      res.status(200).json({
        access_token,
      });
    } catch (err) {
      console.log("-------->", err);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  static async updateGenre(req, res, next) {
    try {
      const { genre } = req.body;
      await req.user.update({ genre });
      res.json({ message: "Genre updated" });
    } catch (err) {
      next(err);
    }
  }
};
