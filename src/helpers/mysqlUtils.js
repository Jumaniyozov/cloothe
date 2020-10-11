require('dotenv').config();
const Sequelize = require('sequelize');

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

const mysql = new MySQL(process.env.DBHOST, process.env.DBUSER, process.env.DBPASS, process.env.DBNAME);
module.exports = mysql.connection;