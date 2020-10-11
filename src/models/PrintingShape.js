const MySQL = require('../helpers/mysqlUtils.js')
const Sequelize = require('sequelize');

const PrintingShape = MySQL.define('printingtype', {
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
    type: {
        type: Sequelize.STRING,
    }
}, {
    timestamps: false
});



// PrintingDetails.sync({ force: true });

module.exports = PrintingShape;
