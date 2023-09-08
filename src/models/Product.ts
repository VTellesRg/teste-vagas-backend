import {Model, DataTypes} from 'sequelize';
import {sequelize} from '../instances/mysql';

export interface ProductInstance extends Model {
	code: number;
	name: string;
	cost_price: number;
	sales_price: number;
}

export const Product = sequelize.define<ProductInstance>('Product', {
	code: {
		type: DataTypes.INTEGER,
		allowNull: false,
		primaryKey: true,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	cost_price: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	sales_price: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
}, {
	tableName: 'products',
	timestamps: false,
});