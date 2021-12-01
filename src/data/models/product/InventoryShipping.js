import DataType from 'sequelize';
import Model from '../../sequelize';

const tableName = 'InventoryShipping';

export default Model.define(
	tableName,
	{
		VariantID: {
			type: DataType.BIGINT,
			primaryKey: true,
		},

		shippingMethod: {
			type: DataType.STRING,
			allowNull: true,
		},

		codeNmfc: {
			type: DataType.STRING,
			allowNull: true,
		},

		codeHts: {
			type: DataType.STRING,
			allowNull: true,
		},

		freightClass: {
			type: DataType.STRING,
			allowNull: true,
		},

		nOfPackages: {
			type: DataType.INTEGER,
			allowNull: true,
		},

		weightTotalLb: {
			type: DataType.DECIMAL(8, 2),
			allowNull: true,
		},

		shopifyWeight: {
			type: DataType.DECIMAL(8, 2),
			allowNull: true,
		},
	},
	{
		createdAt: false,
	},
);
