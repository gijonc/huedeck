/**
 * Huedeck, Inc
 */
import shortid from 'shortid';

import DataType from 'sequelize';
import Model from '../../sequelize';

const Collection = Model.define('Collection', {
	// basic data
	id: {
		type: DataType.STRING,
		primaryKey: true,
	},

	title: {
		type: DataType.STRING(128),
		allowNull: false,
	},

	description: {
		type: DataType.TEXT,
		allowNull: true,
	},

	primaryTag: {
		type: DataType.STRING,
		allowNull: true,
	},

	palette: {
		type: DataType.STRING,
		allowNull: true,
	},

	completed: {
		type: DataType.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	},

	public: {
		type: DataType.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	},
});

Collection.beforeCreate(async _c => {
	const c = _c;

	// TODO: double check if id already exists
	c.id = shortid.generate();
});

export default Collection;
