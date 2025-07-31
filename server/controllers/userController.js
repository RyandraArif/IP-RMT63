require("dotenv").config();
const { User } = require("../models");
const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();

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
          genre: "Unknown",
        });
      }

      const access_token = signToken({ id: user.id });
      res.status(200).json({ message: "Login Success", access_token });
    } catch (err) {
      next(err);
    }
  }

  static async register(req, res, next) {
    try {
      const { name, email, password, genre, profilePict } = req.body;

      if (!genre || genre.trim() === "") {
        throw { name: "BadRequest", message: "Genre is required" };
      }

      const user = await User.create({
        name,
        email,
        password,
        genre,
        profilePict,
      });

      res.status(201).json({
        id: user.id,
        email: user.email,
        genre: user.genre,
      });
    } catch (err) {
      // console.log("----------->", err);

      next(err);
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
          message: "Invalid email or password",
        };
      }

      const validPassword = comparePassword(password, user.password);
      if (!validPassword) {
        throw {
          name: "Unauthorized",
          message: "Invalid email or password",
        };
      }

      const access_token = signToken({ id: user.id });
      res.status(200).json({
        access_token,
      });
    } catch (err) {
      // console.log("-------->", err);
      // res.status(500).json({
      //   message: "Internal server error",
      // });
      next(err);
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

  static async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await User.findByPk(userId, {
        attributes: ["id", "email", "genre"],
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ data: user });
    } catch (error) {
      next(error);
    }
  }
};
