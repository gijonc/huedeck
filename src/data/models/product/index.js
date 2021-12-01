/* eslint-disable import/prefer-default-export */

import Inventory from './Inventory';
import Product from './Product';
import Color from './ProductColor';
import Media from './ProductMedia';
import Option from './ProductOption';
import OptionValue from './OptionValue';
import InventoryShipping from './InventoryShipping';
import ShippingSize from './ShippingSize';

Product.hasMany(Inventory, {
	foreignKey: 'ProductID',
	as: 'variants',
	onUpdate: 'cascade',
	onDelete: 'cascade',
});

Inventory.belongsTo(Product, {
	foreignKey: 'ProductID',
	as: 'product',
});

Inventory.hasOne(InventoryShipping, {
	foreignKey: 'VariantID',
	as: 'shipping',
	onUpdate: 'cascade',
	onDelete: 'cascade',
});

InventoryShipping.belongsTo(Inventory, {
	foreignKey: 'VariantID',
	as: 'variant',
});

InventoryShipping.hasMany(ShippingSize, {
	foreignKey: 'VariantID',
	as: 'size',
	onUpdate: 'cascade',
	onDelete: 'cascade',
});

Product.hasMany(Color, {
	foreignKey: 'ProductID',
	as: 'colors',
	onUpdate: 'cascade',
	onDelete: 'cascade',
});

Product.hasMany(Media, {
	foreignKey: 'ProductID',
	as: 'medias',
	onUpdate: 'cascade',
	onDelete: 'cascade',
});

Product.hasMany(Option, {
	foreignKey: 'ProductID',
	as: 'options',
	onUpdate: 'cascade',
	onDelete: 'cascade',
});

Option.hasMany(OptionValue, {
	foreignKey: 'OptionID',
	as: 'values',
	onUpdate: 'cascade',
	onDelete: 'cascade',
});

Media.hasMany(Inventory, {
	foreignKey: 'MediaID',
	as: 'media_variants',
});

Inventory.belongsTo(Media, {
	foreignKey: 'MediaID',
	as: 'variantImage',
});

export { Product, Color, Media, Inventory, Option, OptionValue, InventoryShipping, ShippingSize };
