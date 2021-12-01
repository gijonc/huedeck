/* eslint-disable camelcase */

/**
 *	Huedeck, Inc
 */

import sequelize from '../sequelize';

import { CollectionItem, User_saved_Collection, RoomSceneProduct } from './relationships';
import { CartItem, UserCart, CartItemPalette } from './cart';
import {
	User,
	UserLogin,
	UserClaim,
	UserProfile,
	UserOrder,
	UserVerificationCode,
	UserPreference,
} from './user';
import { Collection, CollectionTag, CollectionImage } from './collection';
import { Inventory, Media, Product, Option, OptionValue, Color } from './product';
import { RoomScene } from './roomScene';

// Collection - product relation
Inventory.belongsToMany(Collection, {
	through: CollectionItem,
	as: 'belongCollections',
	foreignKey: 'ItemID',
	onUpdate: 'cascade',
	onDelete: 'cascade',
});

Collection.belongsToMany(Inventory, {
	through: CollectionItem,
	as: 'items',
	foreignKey: 'CollectionID',
	onUpdate: 'cascade',
	onDelete: 'cascade',
});

Collection.belongsTo(UserProfile, {
	foreignKey: 'authorId',
	as: 'author',
});

// Collection User (saved) relation
User.belongsToMany(Collection, {
	through: User_saved_Collection,
	as: 'savedCollections',
	foreignKey: 'UserID',
	onUpdate: 'cascade',
	onDelete: 'cascade',
});

Collection.belongsToMany(User, {
	through: User_saved_Collection,
	as: 'savedUser',
	foreignKey: 'CollectionID',
});

/**
 *  Shopping Cart
 */

User.hasOne(UserCart, {
	foreignKey: 'UserID',
	as: 'cart',
});

UserOrder.belongsTo(UserCart, {
	as: 'cart',
	foreignKey: 'CartID',
	onUpdate: 'cascade',
	onDelete: 'cascade',
});

CartItem.belongsTo(Inventory, {
	as: 'variant',
	foreignKey: 'ItemID',
	onUpdate: 'cascade',
	onDelete: 'cascade',
});

/**
 * Room scene
 */

RoomScene.belongsToMany(Product, {
	through: RoomSceneProduct,
	as: 'products',
	foreignKey: 'RoomSceneID',
	onUpdate: 'cascade',
	onDelete: 'cascade',
});

Product.belongsToMany(RoomScene, {
	through: RoomSceneProduct,
	as: 'roomScene',
	foreignKey: 'ProductID',
	onUpdate: 'cascade',
	onDelete: 'cascade',
});

function sync(...args) {
	return sequelize.sync(...args);
}

export default { sync };
export {
	// product related
	Product,
	Inventory,
	Media,
	Option,
	OptionValue,
	Color,
	// user related
	User,
	UserLogin,
	UserClaim,
	UserProfile,
	UserOrder,
	UserVerificationCode,
	UserPreference,
	// cart related
	UserCart,
	CartItem,
	CartItemPalette,
	// collection related
	User_saved_Collection,
	Collection,
	CollectionTag,
	CollectionItem,
	CollectionImage,
	// Room scene related
	RoomScene,
	RoomSceneProduct,
};
