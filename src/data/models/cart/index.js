import UserCart from './UserCart';
import CartItem from './CartItem';
import CartItemPalette from './CartItemPalette';

UserCart.hasMany(CartItem, {
	as: 'cartItems',
	foreignKey: 'CartID',
});

CartItem.hasMany(CartItemPalette, {
	as: 'paletteList',
	foreignKey: 'CartItemID',
	onUpdate: 'cascade',
	onDelete: 'cascade',
});

CartItemPalette.belongsTo(CartItem, {
	as: 'paletteItem',
	foreignKey: 'CartItemID',
});

export { CartItem, UserCart, CartItemPalette };
