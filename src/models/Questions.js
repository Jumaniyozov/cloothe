const MySQL = require('../helpers/mysqlUtils.js')
const Sequelize = require('sequelize');
const Question = MySQL.define('question', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: Sequelize.STRING
    },
    message_id: {
        type: Sequelize.STRING
    },
    user_id: {
        type: Sequelize.STRING
    },
    message_status: {
        type: Sequelize.STRING
    },
    answered: {
        type: Sequelize.STRING

    },
    question: {
        type: Sequelize.STRING

    },
    answer: {
        type: Sequelize.STRING
    },
}, {
    timestamps: false
});

// Question.sync({ force: true });

module.exports = Question;
