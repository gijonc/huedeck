import DataType from 'sequelize';
import Model from '../../sequelize';

const tableName = 'Inventory';

export default Model.define(tableName, {
	VariantID: {
		type: DataType.BIGINT,
		primaryKey: true,
	},

	price: {
		type: DataType.DECIMAL(8, 2),
		allowNull: false,
		validate: {
			min: {
				args: [1],
				msg: 'min value of field [price] is 1',
			},
			isDecimal: {
				args: true,
				msg: '[price] requires 2 decimal numbers',
			},
		},
	},

	msrpPrice: {
		type: DataType.DECIMAL(8, 2),
		allowNull: false,
		validate: {
			min: {
				args: [1],
				msg: 'min value of field [msrpPrice] is 1',
			},
			isDecimal: {
				args: true,
				msg: '`msrpPrice` requires 2 decimal numbers',
			},
		},
	},

	sku: {
		type: DataType.STRING,
		allowNull: false,
		unique: true,
	},

	upc: {
		type: DataType.STRING,
		allowNull: false,
	},

	inventoryQty: {
		type: DataType.INTEGER,
		validate: {
			min: {
				args: [0],
				msg: 'invalid field [inventoryQty]',
			},
		},
	},

	shape: {
		type: DataType.STRING,
	},

	weightLb: {
		type: DataType.DECIMAL(8, 2),
		defaultValue: 0,
		validate: {
			isDecimal: {
				args: true,
				msg: 'field [weightLb] requires 2 decimal numbers',
			},
		},
	},

	heightInch: {
		type: DataType.DECIMAL(8, 2),
		defaultValue: 0,
		isDecimal: {
			args: true,
			msg: 'field [heightInch] requires 2 decimal numbers',
		},
	},

	widthInch: {
		type: DataType.DECIMAL(8, 2),
		defaultValue: 0,
		isDecimal: {
			args: true,
			msg: 'field [widthInch] requires 2 decimal numbers',
		},
	},

	lengthInch: {
		type: DataType.DECIMAL(8, 2),
		defaultValue: 0,
		isDecimal: {
			args: true,
			msg: 'field [lengthInch] requires 2 decimal numbers',
		},
	},

	variantPosition: {
		type: DataType.INTEGER,
		allowNull: false,
		validate: {
			isInt: {
				args: true,
				msg: 'field [variantPosition] must be an integer',
			},
			min: {
				args: [1],
				msg: 'field [variantPosition] must start from 1',
			},
		},
	},

	variantOption1: {
		type: DataType.STRING,
		allowNull: true,
	},

	variantOption2: {
		type: DataType.STRING,
		allowNull: true,
	},

	variantOption3: {
		type: DataType.STRING,
		allowNull: true,
	},
});
