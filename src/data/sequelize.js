import Sequelize from 'sequelize';
import fs from 'fs';
import CONFIG from '../config';

const sequelize = new Sequelize(CONFIG.db.name, CONFIG.db.username, CONFIG.db.password, {
	host: CONFIG.db.host,
	dialect: CONFIG.db.dialect,
	port: CONFIG.db.port,

	operatorsAliases: false,
	dialectOptions: {
		ssl:
			process.env.DB_SSL_PATH && __DEV__
				? {
						ca: fs.readFileSync(`${process.env.DB_SSL_PATH}server-ca.pem`),
						key: fs.readFileSync(`${process.env.DB_SSL_PATH}client-key.pem`),
						cert: fs.readFileSync(`${process.env.DB_SSL_PATH}client-cert.pem`),
				  }
				: false,
	},
	logging: false,

	define: {
		freezeTableName: true,
		charset: 'utf8',
		collate: 'utf8_unicode_ci', // why use unicode ? => https://stackoverflow.com/questions/766809/whats-the-difference-between-utf8-general-ci-and-utf8-unicode-ci
	},
});

sequelize.select = function select(queryStr, ...options) {
	return this.query(queryStr, {
		type: Sequelize.QueryTypes.SELECT,
		...options,
	});
};

export default sequelize;
