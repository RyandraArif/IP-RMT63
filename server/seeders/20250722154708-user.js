"use strict";
const { hashPassword } = require("../helpers/bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkInsert("Users", [
        {
          name: "danang",
          email: "danang@example.com",
          password: hashPassword("123456"),
          profilePict:
            "https://cdn.myanimelist.net/images/characters/9/310307.jpg",
          genre: "action,adventure,shounen,fantasy",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "saputro",
          email: "saputro@example.com",
          password: hashPassword("123456"),
          profilePict:
            "https://cdn.myanimelist.net/images/characters/6/160755.jpg",
          genre: "sliceoflife,supernatural",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    } catch (err) {
      console.log("----------->", err);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, {});
  },
};
