const Sequelize = require('sequelize');
require('dotenv').config()
class MySQL {
	constructor(host, login, password, basename) {
		this.connection = new Sequelize(basename, login, password, {
			host: host,
			dialect: 'mysql',
			define: {
				timestamps: false
			},
		});
	}
}
const mysql = new MySQL(process.env.DB_HOST,process.env.USERNAME, process.env.DB_PASSWORD, process.env.DB_BASE)
module.exports = mysql.connection;