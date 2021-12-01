import DataType from 'sequelize';
import Model from '../../sequelize';

const tableName = 'ShippingSize';

export default Model.define(
	tableName,
	{
		packageIndex: {
			type: DataType.INTEGER,
			allowNull: false,
			unique: 'composite',
			validate: {
				isInt: {
					args: true,
					msg: 'field [packageIndex] must be an integer',
				},
				min: {
					args: [1],
					msg: 'field [packageIndex] must start from 1',
				},
			},
		},

		VariantID: {
			type: DataType.BIGINT,
			unique: 'composite',
			allowNull: false,
		},

		shippingWeightLb: {
			type: DataType.DECIMAL(8, 2),
			allowNull: true,
		},

		shippingSizeLenghtIn: {
			type: DataType.DECIMAL(8, 2),
			allowNull: true,
		},

		shippingSizeWidthIn: {
			type: DataType.DECIMAL(8, 2),
			allowNull: true,
		},

		shippingSizeHeightIn: {
			type: DataType.DECIMAL(8, 2),
			allowNull: true,
		},
	},
	{
		createdAt: false,
	},
);
