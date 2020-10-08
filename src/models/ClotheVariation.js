const MySQL = require('../helpers/mysqlUtils.js')
const Sequelize = require('sequelize');
const Catalogue = require('./Catalogue');

const ClotheVariation = MySQL.define('variation', {
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
    captionRu: {
        type: Sequelize.STRING,
    },
    captionUz: {
        type: Sequelize.STRING,
    },
    clothe: {
        type: Sequelize.INTEGER,
    },
    photoUrl: {
        type: Sequelize.STRING,
    },
    price: {
        type: Sequelize.FLOAT
    }
}, {
    timestamps: false
});

ClotheVariation.belongsTo(Catalogue, {foreignKey: 'clothe', targetKey: 'ID'});

module.exports = ClotheVariation;
