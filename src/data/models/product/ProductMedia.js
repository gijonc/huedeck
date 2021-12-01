import DataType from 'sequelize';
import Model from '../../sequelize';

const tableName = 'ProductMedia';
export default Model.define(
	tableName,
	{
		MediaID: {
			type: DataType.BIGINT,
			primaryKey: true,
		},

		mediaType: {
			type: DataType.STRING,
			allowNull: false,
			validate: {
				isIn: {
					args: [['image', 'video']],
					msg: 'field [mediaType] must be either "image" or "video"',
				},
			},
		},

		src: {
			type: DataType.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isUrl: {
					args: true,
					msg: 'invalid [src] format',
				},
			},
		},

		miniPic: {
			type: DataType.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isUrl: {
					args: true,
					msg: 'invalid [miniPic] format (not an URL)',
				},
			},
		},

		position: {
			type: DataType.INTEGER,
			allowNull: true,
			validate: {
				isInt: {
					args: true,
					msg: 'field [position] must be an integer',
				},
			},
		},

		alt: {
			type: DataType.STRING,
			allowNull: true,
		},

		width: {
			type: DataType.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},

		height: {
			type: DataType.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
	},
	{
		timestamps: false,
	},
);
