const MySQL = require('../helpers/mysqlUtils.js')
const Sequelize = require('sequelize');
const AboutUs = MySQL.define('about', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    about: {
        type: Sequelize.STRING,
    }
}, {
    timestamps: false, freezeTableName: true
});

// Catalogue.sync({ force: true });

module.exports = AboutUs;
