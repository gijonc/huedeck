/**
 * Huedeck, Inc
 */

import { merge } from 'lodash';

/**
 * User
 */
import {
	schema as GetAllUsers,
	queries as GetAllUsersQueries,
	resolvers as GetAllUsersResolver,
} from './users/GetAllUsers';

import {
	queries as GetLoggedInUserQueries,
	resolvers as GetLoggedInUserResolver,
} from './users/GetLoggedInUser';

import {
	schema as CreateUserSchema,
	mutation as CreateUser,
	resolvers as CreateUserResolver,
} from './users/CreateUser';

import {
	schema as EditUserSchema,
	mutation as EditUser,
	resolvers as EditUserResolver,
} from './users/EditUser';

import {
	schema as SecureUserSchema,
	mutation as SecureUser,
	resolvers as SecureUserResolver,
} from './users/SecureUser';

/**
 * Product
 */

import {
	schema as GetProductsSchema,
	queries as GetProductsQueries,
	resolvers as GetProductsResolver,
} from './products/GetProducts';

import {
	schema as GetPdInParellelSchema,
	queries as GetPdInParellelQueries,
	resolvers as GetPdInParellelResolver,
} from './products/GetPdInParellel';

import {
	schema as GetPdByRoomSchema,
	queries as GetPdByRoomQueries,
	resolvers as GetPdByRoomResolver,
} from './products/GetPdByRoom';

import {
	schema as GetPdByCatalogSchema,
	queries as GetPdByCatalogQueries,
	resolvers as GetPdByCatalogResolver,
} from './products/GetPdByCatalog';

import {
	schema as GetPdByBrandSchema,
	queries as GetPdByBrandQueries,
	resolvers as GetPdByBrandResolver,
} from './products/GetPdByBrand';
/**
 * Shopping cart
 */
import {
	schema as GetShoppingCartSchema,
	queries as ShoppingCartQueries,
	resolvers as GetShoppingCartResolver,
} from './shoppingCart/GetUserShoppingCart';

import {
	schema as MutateShoppingCartSchema,
	mutation as MutateShoppingCart,
	resolvers as MutateShoppingCartResolver,
} from './shoppingCart/MutateUserShoppingCart';

/**
 * Collection
 */

import {
	schema as GetCollectionSchema,
	queries as CollectionQueries,
	resolvers as GetCollectionResolver,
} from './collections/GetCollection';

import {
	schema as MutateCollectionSchema,
	mutation as MutateCollection,
	resolvers as MutateCollectionResolver,
} from './collections/MutateCollection';

/**
 * User Order
 */
import {
	schema as GetUserOrderSchema,
	queries as GetUserOrderQueries,
	resolvers as GetUserOrderResolver,
} from './orderHistory/getUserOrder';

import {
	schema as MutateUserOrderSchema,
	mutation as MutateUserOrder,
	resolvers as MutateUserOrderResolver,
} from './orderHistory/mutateUserOrder';

/**
 * Room Scene
 */

import {
	schema as GetRoomSceneSchema,
	queries as GetRoomSceneQueries,
	resolvers as GetRoomSceneResolver,
} from './roomScene/getRoomScene';

/**
 * room
 */

import {
	schema as ShopRoomSchema,
	queries as ShopRoomQueries,
	resolvers as ShopRoomResolver,
} from './ShopRoom/GetRoom';

export const schema = [
	// user
	...GetAllUsers,
	...CreateUserSchema,
	...SecureUserSchema,
	...EditUserSchema,

	// cart
	...MutateShoppingCartSchema,
	...GetShoppingCartSchema,

	// collection
	...GetCollectionSchema,
	...MutateCollectionSchema,

	// product
	...GetProductsSchema,
	...GetPdInParellelSchema,
	...GetPdByRoomSchema,
	...GetPdByCatalogSchema,
	...GetPdByBrandSchema,

	// order
	...GetUserOrderSchema,
	...MutateUserOrderSchema,

	// room scene
	...GetRoomSceneSchema,

	// shop by room
	...ShopRoomSchema,
];

export const queries = [
	// user
	...GetAllUsersQueries,
	...GetLoggedInUserQueries,

	// product
	...GetProductsQueries,
	...GetPdInParellelQueries,
	...GetPdByRoomQueries,
	...GetPdByCatalogQueries,
	...GetPdByBrandQueries,

	// cart
	...ShoppingCartQueries,

	// collection
	...CollectionQueries,

	// order
	...GetUserOrderQueries,

	// room scene
	...GetRoomSceneQueries,

	// shop room
	...ShopRoomQueries,
];

export const mutations = [
	...CreateUser,
	...MutateShoppingCart,
	...MutateCollection,
	...SecureUser,
	...MutateUserOrder,
	...EditUser,
];

export const resolvers = merge(
	// user
	GetAllUsersResolver,
	GetLoggedInUserResolver,
	CreateUserResolver,
	SecureUserResolver,
	EditUserResolver,
	// product
	GetProductsResolver,
	GetPdInParellelResolver,
	// cart
	MutateShoppingCartResolver,
	GetShoppingCartResolver,
	// collection
	GetCollectionResolver,
	MutateCollectionResolver,
	// order
	GetUserOrderResolver,
	MutateUserOrderResolver,
	// product
	GetProductsResolver,
	GetPdInParellelResolver,
	GetPdByRoomResolver,
	GetPdByCatalogResolver,
	GetPdByBrandResolver,
	// room scene
	GetRoomSceneResolver,
	// shop room
	ShopRoomResolver,
);
