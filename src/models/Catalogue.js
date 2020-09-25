const MySQL = require('../helpers/mysqlUtils.js')
const Sequelize = require('sequelize');
const Catalogue = MySQL.define('catalog', {
    ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    clotheType: {
        type: Sequelize.STRING,
    },
    photoUrl: {
        type: Sequelize.STRING,
    },
    ruName: {
        type: Sequelize.STRING,

    },
    uzName: {
        type: Sequelize.STRING,

    },
}, {
    timestamps: false
});

module.exports = Catalogue;
