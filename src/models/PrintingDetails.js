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
        type: Sequelize.FLOAT
    },
    coordinatey: {
        type: Sequelize.FLOAT
    },
    photoName: {
        type: Sequelize.STRING
    },
    resizeWidth: {
        type: Sequelize.FLOAT
    },
    resizeHeight: {
        type: Sequelize.FLOAT
    },
    correctionx: {
        type: Sequelize.FLOAT,
    },
    correctiony: {
        type: Sequelize.FLOAT,
    },
    clothe: {
        type: Sequelize.INTEGER,
    }
}, {
    timestamps: false
});


PrintingDetails.belongsTo(Catalogue, {foreignKey: 'clothe', targetKey: 'ID'});

// PrintingDetails.sync({ force: true });

module.exports = PrintingDetails;
