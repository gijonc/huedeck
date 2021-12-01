/* eslint-disable camelcase */

/**
 *	Huedeck, Inc
 */

import DataType from 'sequelize';
import Model from '../../sequelize';

const CollectionItem = Model.define('CollectionItem', {}, { timestamps: false });
const User_saved_Collection = Model.define('User_saved_Collection', {}, { timestamps: false });
const RoomSceneProduct = Model.define(
	'RoomSceneProduct',
	{
		id: {
			autoIncrement: true,
			primaryKey: true,
			type: DataType.INTEGER,
		},

		RoomSceneID: {
			type: DataType.BIGINT,
		},

		ProductID: {
			type: DataType.BIGINT,
		},
	},
	{
		timestamps: false,
	},
);

export { CollectionItem, User_saved_Collection, RoomSceneProduct };
