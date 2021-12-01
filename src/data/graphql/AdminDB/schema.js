/**
 * Huedeck, Inc
 */

import { merge } from 'lodash';

/**
 * Collection
 */
import {
	schema as GetAdminCollectionSchema,
	queries as AdminCollectionQueries,
	resolvers as GetAdminCollectionResolver,
} from './collections/GetAdminCollection';

import {
	schema as MutateAdminCollectionSchema,
	mutation as MutateAdminCollection,
	resolvers as MutateAdminCollectionResolver,
} from './collections/MutateAdminCollection';

/**
 * Shopify Products
 */
import {
	schema as GetProductSchema,
	queries as ProductQueries,
	resolvers as ProductResolver,
} from './products/GetProducts';

import {
	schema as MutateProductSchema,
	mutation as MutateProduct,
	resolvers as MutateProductResolver,
} from './products/MutateProducts';

// exports

export const schema = [
	...MutateAdminCollectionSchema,
	...GetAdminCollectionSchema,
	...GetProductSchema,
	...MutateProductSchema,
];

export const queries = [...AdminCollectionQueries, ...ProductQueries];

export const mutations = [...MutateAdminCollection, ...MutateProduct];

export const resolvers = merge(
	MutateAdminCollectionResolver,
	GetAdminCollectionResolver,
	ProductResolver,
	MutateProductResolver,
);
