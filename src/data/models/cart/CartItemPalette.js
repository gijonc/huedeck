/**
 *	Huedeck, Inc
 */

import DataType from 'sequelize';
import Model from '../../sequelize';

const tableName = 'CartItemPalette';
const CartItemPalette = Model.define(
	tableName,
	{
		palette: {
			type: DataType.STRING,
			allowNull: false,
			unique: 'compositeIndex',
		},

		// foreign keys
		CartItemID: {
			type: DataType.INTEGER,
			allowNull: false,
			unique: 'compositeIndex',
		},
	},
	{
		updatedAt: false,
	},
);

export default CartItemPalette;
