import {Model, DataTypes} from 'sequelize';
import {sequelize} from '../instances/mysql';

export interface PacksInstance extends Model {
	id: number;
	pack_id: number;
	product_id: number;
	qty: number;
}

export const Packs = sequelize.define<PacksInstance>('Packs', {
	id: {
		type: DataTypes.INTEGER,
		allowNull: false,
		primaryKey: true,
	},
	pack_id: {
		type: DataTypes.NUMBER,
		allowNull: false,
	},
	product_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	qty: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
}, {
	tableName: 'packs',
	timestamps: false,
});