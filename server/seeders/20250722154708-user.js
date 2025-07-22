"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = [
      {
        name: "Mugiwara Luffy",
        email: "luffy@example.com",
        profilePict:
          "https://cdn.myanimelist.net/images/characters/9/310307.jpg",
        genre: "action,adventure,shounen,fantasy",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Natsume Takashi",
        email: "natsume@example.com",
        profilePict:
          "https://cdn.myanimelist.net/images/characters/6/160755.jpg",
        genre: "sliceoflife,supernatural",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("Users", users);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, {});
  },
};
