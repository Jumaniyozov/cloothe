const MySQL = require('../helpers/mysqlUtils.js')
const Sequelize = require('sequelize');

const HotQuestion = MySQL.define('hotquestion', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    question: {
        type: Sequelize.STRING,
    },
    answer: {
        type: Sequelize.STRING,
    }
}, {
    timestamps: false
});



module.exports = HotQuestion;
