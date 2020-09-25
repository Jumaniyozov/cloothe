const MySQL = require('../helpers/mysqlUtils.js')
const Sequelize = require('sequelize');
const Catalogue = require('./Catalogue');

const PrintingDetails = MySQL.define('printingdetail', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nameRu: {
        type: Sequelize.STRING,
    },
    nameUz: {
        type: Sequelize.STRING,
    },
    coordinatex: {
        type: Sequelize.STRING
    },
    coordinatey: {
        type: Sequelize.STRING
    },
    photoName: {
        type: Sequelize.STRING
    },
    resizeWidth: {
        type: Sequelize.STRING
    },
    resizeHeight: {
        type: Sequelize.STRING
    },
    clothe: {
        type: Sequelize.INTEGER,
    }
}, {
    timestamps: false
});


PrintingDetails.belongsTo(Catalogue, {foreignKey: 'clothe', targetKey: 'ID'});


module.exports = PrintingDetails;
