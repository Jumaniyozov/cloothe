const MySQL = require('../helpers/mysqlUtils.js')
const Sequelize = require('sequelize');
const Catalogue = require('./Catalogue');

const PrintingColors = MySQL.define('printingcolor', {
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
    photoFront: {
        type: Sequelize.STRING
    },
    photoBack: {
        type: Sequelize.STRING
    },
    clothe: {
        type: Sequelize.INTEGER,
    }
}, {
    timestamps: false
});


PrintingColors.belongsTo(Catalogue, {foreignKey: 'clothe', targetKey: 'ID'});

// PrintingColors.sync({ force: true });

module.exports = PrintingColors;
