/* eslint-disable prefer-const */
/* eslint-disable camelcase */

/**
 *	Huedeck, Inc
 */

import { Op } from 'sequelize';
import {
	Collection,
	CollectionTag,
	UserProfile,
	User,
	Product,
	CollectionImage,
	Media,
	Inventory,
	Option,
	OptionValue,
} from '../../../models';
import { to, ValidationError } from '../../utils';

export const schema = [
	`
	type TagType {
		collectionId: String!
		tag: String!
		tagContent: String!
		option: String
	}

	type SavedUserType {
		count: Int!
		hasClientSaved: Boolean!
	}

	type CollectionImages {
		position: Int!
		src: String!
	}

	type CollectionType {
		id: String
		title: String
		description: String
		primaryTag: String
		palette: [String!]
		public: Boolean
		completed: Boolean
		createdAt: String
		updatedAt: String

		author: DatabaseUserProfile
		items: [ProductVariantType]
		images: [CollectionImages]
		tags: [TagType]
		savedUser: SavedUserType
	}

	type CollectionListType {
		collections: [CollectionType!] !
		name: String!
	}

	`,
];

export const queries = [
	`
	getOneCollection(
		collectionId: String!
		userId: String
	): CollectionType

	# for getting collection by one tag
	getCollectionsByTag(
		tagContent: String!
	): [CollectionType]

	# for getting collection by specified primary tags
	getAllCollections(
		limit: Int
		tagList: [String!]!
	): [CollectionListType]

	getUserSavedCollectionList: [CollectionType]

	getCollectionByIds(
		idList: [String!]
	): [CollectionType]

	`,
];

const ITEM_PER_COLLECTION_CARD = 15;

function updateUserSavedCollection(cl, context, limitedItem) {
	if (!cl) return null;

	const result = cl.get({
		plain: true,
	});
	// check if this collection has been saved by thr request client
	result.savedUser = {
		count: cl.savedUser.length,
		hasClientSaved: false,
	};

	if (limitedItem) result.items = result.items.slice(0, ITEM_PER_COLLECTION_CARD);

	if (context.user && cl.savedUser.length) {
		const saved = Boolean(cl.savedUser.find(obj => obj.id === context.user.id));
		result.savedUser.hasClientSaved = saved;
	}

	if (typeof result.palette === 'string') {
		result.palette = result.palette.split(',');
	}
	return result;
}

export const resolvers = {
	RootQuery: {
		async getOneCollection(parent, args) {
			const [err, collection] = await to(
				Collection.findOne({
					where: {
						id: args.collectionId,
						// require this collection to be public
						completed: true,
						public: true,
					},
					include: [
						{
							model: UserProfile,
							as: 'author',
							attributes: ['displayName'],
						},
						{
							model: Inventory,
							attributes: ['VariantID'],
							as: 'items',
							include: [
								{
									model: Product,
									as: 'product',
									attributes: [
										'ProductID',
										'productName',
										'status',
										'topSeller',
										'minPrice',
										'maxPrice',
									],
									include: [
										{
											model: Inventory,
											as: 'variants',
											include: [
												{
													model: Media,
													as: 'variantImage',
													attributes: ['alt', 'miniPic', 'src'],
												},
											],
										},
										{
											model: Option,
											as: 'options',
											attributes: ['optionName', 'optionPosition'],
											include: [
												{
													model: OptionValue,
													as: 'values',
													attributes: ['value'],
													where: {
														value: {
															[Op.ne]: 'Default Title',
														},
													},
												},
											],
										},
									],
								},
							],
						},
						{
							model: CollectionTag,
							as: 'tags',
							attributes: ['tag', 'tagContent'],
						},
						{
							model: CollectionImage,
							as: 'images',
							attributes: ['src', 'position'],
						},
						{
							model: User,
							as: 'savedUser',
							attributes: ['id'],
						},
					],
				}).then(res =>
					updateUserSavedCollection(res, {
						user: {
							id: args.userId,
						},
					}),
				),
			);

			if (err) {
				throw err.message;
			}

			return collection;
		},

		async getCollectionsByTag(parent, args, context) {
			const { tagContent } = args;

			const [err, collecions] = await to(
				Collection.findAll({
					attributes: ['id', 'title', 'palette', 'createdAt'],
					order: [['createdAt', 'DESC']],
					where: {
						public: true,
						completed: true,
					},
					include: [
						{
							model: Inventory,
							attributes: ['VariantID'],
							as: 'items',
							include: [
								{
									model: Media,
									as: 'variantImage',
									attributes: ['miniPic', 'alt', 'src'],
								},
							],
						},
						{
							model: CollectionTag,
							as: 'tags',
							attributes: ['tag', 'tagContent'],
							where: { tagContent },
						},
						{
							model: User,
							as: 'savedUser',
							attributes: ['id'],
						},
					],
				}).then(cl => {
					const list = [];
					if (cl && context) {
						for (let i = 0, len = cl.length; i < len; i += 1) {
							const result = updateUserSavedCollection(cl[i], context, true);
							list.push(result);
						}
					}
					return list;
				}),
			);

			if (err) {
				const { message } = err;
				console.error(message);
				throw new ValidationError([message]);
			}

			return collecions || [];
		},

		async getAllCollections(parent, args, context) {
			// function will called below
			function getCollectionPromise(primaryTag) {
				return Collection.findAll({
					attributes: ['id', 'title', 'palette', 'createdAt'],
					order: [['createdAt', 'DESC']],
					limit: args.limit, // max number of collection to fetch is 4
					where: {
						public: true,
						completed: true,
						primaryTag,
					},
					include: [
						{
							model: Inventory,
							attributes: ['VariantID'],
							as: 'items',
							include: [
								{
									model: Media,
									as: 'variantImage',
									attributes: ['miniPic', 'alt', 'src'],
								},
							],
						},
						{
							model: User,
							as: 'savedUser',
							attributes: ['id'],
						},
					],
				}).then(cl => {
					const list = [];
					if (cl && context) {
						for (let i = 0, len = cl.length; i < len; i += 1) {
							const result = updateUserSavedCollection(cl[i], context, true);
							list.push(result);
						}
					}
					return {
						collections: list,
						name: primaryTag,
					};
				});
			}

			try {
				const { tagList } = args;
				const promises = [];
				for (let i = 0, len = tagList.length; i < len; i += 1) {
					const prom = getCollectionPromise(tagList[i]);
					promises.push(prom);
				}
				const result = await Promise.all(promises);
				return result || [];
			} catch (err) {
				const { message } = err;
				console.error(message);
				throw new ValidationError([message]);
			}
		},

		async getUserSavedCollectionList(parent, args, context) {
			if (!context.user) return null;

			const [err, CollectionList] = await to(
				Collection.findAll({
					include: [
						{
							model: User,
							as: 'savedUser',
							required: true,
							where: { id: context.user.id },
						},
						{
							model: CollectionTag,
							as: 'tags',
						},
						{
							model: Inventory,
							as: 'items',
							include: [
								{
									model: Media,
									as: 'variantImage',
								},
							],
						},
						{
							model: UserProfile,
							as: 'author',
							attributes: ['displayName', 'picture'],
						},
					],
				}).then(cl => {
					const result = cl;

					for (let i = 0, len = result.length; i < len; i += 1) {
						result[i].items = result[i].items.slice(0, ITEM_PER_COLLECTION_CARD);
						if (typeof result[i].palette === 'string') {
							result[i].palette = result[i].palette.split(',');
						}
					}

					return result;
				}),
			);

			if (err) {
				const { message } = err;
				console.error(message);
				throw new ValidationError([message]);
			}

			return CollectionList || [];
		},

		async getCollectionByIds(parent, args) {
			const [err, collections] = await to(
				Collection.findAll({
					attributes: ['id', 'title', 'palette'],
					order: [['createdAt', 'DESC']],
					where: {
						public: true,
						completed: true,
						id: args.idList,
					},
					include: [
						{
							model: Inventory,
							attributes: ['VariantID'],
							as: 'items',
							include: [
								{
									model: Media,
									as: 'variantImage',
									attributes: ['miniPic', 'alt', 'src'],
								},
							],
						},
					],
				}).then(res => {
					const result = res;
					for (let i = 0, len = result.length; i < len; i += 1) {
						result[i].palette = result[i].palette.split(',');
					}
					return result;
				}),
			);

			if (err) throw err.message;

			return collections;
		},
	},
};
