/**
 *	Huedeck, Inc
 */

import DataType from 'sequelize';
import Model from '../../sequelize';

const tableName = 'CartItem';
const CartItem = Model.define(tableName, {
	id: {
		type: DataType.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},

	inStock: {
		type: DataType.BOOLEAN,
		defaultValue: true,
		allowNull: false,
	},

	quantity: {
		type: DataType.INTEGER,
		defaultValue: 1,
		allowNull: false,
	},

	shopifyLineId: {
		type: DataType.STRING,
		allowNull: false,
	},

	ItemID: {
		type: DataType.BIGINT,
		allowNull: false,
		unique: 'compositeIndex',
	},

	CartID: {
		type: DataType.STRING,
		allowNull: false,
		unique: 'compositeIndex',
	},
});

export default CartItem;
