const MySQL = require('../helpers/mysqlUtils.js')
const Sequelize = require('sequelize');
const Catalogue = require('./Catalogue');

const ClotheMaterial = MySQL.define('material', {
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
}, {
    timestamps: false
});

ClotheMaterial.belongsTo(Catalogue, {foreignKey: 'clothe', targetKey: 'ID'});

module.exports = ClotheMaterial;
