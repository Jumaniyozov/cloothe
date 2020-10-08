const MySQL = require('../helpers/mysqlUtils.js')
const Sequelize = require('sequelize');
const Catalogue = require('./Catalogue');

const ClotheSize = MySQL.define('size', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    size: {
        type: Sequelize.STRING,
    },
    sizeInNumbers: {
        type: Sequelize.STRING,
    },
    clothe: {
        type: Sequelize.STRING,
    }
}, {
    timestamps: false
});


ClotheSize.belongsTo(Catalogue, {foreignKey: 'clothe', targetKey: 'clotheType'});
module.exports = ClotheSize;
