/* eslint-disable prefer-const */
/* eslint-disable camelcase */

/**
 *	Huedeck, Inc
 */

// import { Op } from 'sequelize';

import { Collection, CollectionTag } from 'data/models';

import { CollectionItem } from 'data/models/relationships';
import { to, ValidationError } from '../../utils';

export const schema = [
	`
	type MutateAdminCollectionResult {
		success: Boolean!
		collection: CollectionType
	}

	input TagInput {
		tag: String!
		tagContent: String!
		option: String
	}

	input CollectionInput {
		title: String
		description: String
		palette: [String!]
		completed: Boolean
	}

	`,
];

export const mutation = [
	`
	createCollection(
		content: CollectionInput
	) : MutateAdminCollectionResult
	
	updateCollection(
		collectionId: String!
		content: CollectionInput
	): MutateAdminCollectionResult

	deleteCollection(
		collectionId: String!
	): MutateAdminCollectionResult

	addCollectionItem(
		collectionId: String!
		itemId: String!
	): MutateAdminCollectionResult

	deleteCollectionItem(
		collectionId: String!
		itemId: String!
	): MutateAdminCollectionResult
	
	addCollectionTag(
		collectionId: String!
		content: TagInput!
	): MutateAdminCollectionResult

	deleteCollectionTag(
		collectionId: String!
		content: TagInput!
	): MutateAdminCollectionResult
	
	`,
];

export const resolvers = {
	Mutation: {
		async createCollection(parent, args, context) {
			const { user } = context;
			if (!user || user.profile.roleType === 'guest') return null;

			const errors = [];
			let err;
			let success = false;

			const createContent = args.content;

			createContent.authorId = context.user.id;
			Object.keys(createContent).map(key => {
				if (key === 'palette') {
					createContent[key] = createContent[key].toString();
				}
				if (typeof createContent[key] === 'string') {
					createContent[key] = createContent[key].trim();
					if (key === 'title' && !createContent[key]) {
						createContent[key] = `New Collection`;
					}
				}
				return 1;
			});

			[err, success] = await to(Collection.create(createContent));

			if (err) {
				errors.push({
					key: 'createCollection',
					message: err,
				});
			}

			if (errors.length > 0) throw new ValidationError(errors);

			return {
				success: Boolean(success),
				collection: success,
			};
		},

		async updateCollection(parent, args, context) {
			const { user } = context;
			if (!user || user.profile.roleType === 'guest') return null;

			const errors = [];
			let err;
			let success = false;
			let executeUpdate = true;
			const updateContent = args.content;

			Object.keys(updateContent).map(async key => {
				if (key === 'palette') {
					updateContent[key] = updateContent[key].toString();
				}

				if (updateContent[key] && typeof updateContent[key] === 'string') {
					updateContent[key] = updateContent[key].trim();
					if (!updateContent[key]) {
						executeUpdate = false;
					}
				}
			});

			// check if going to execute Update
			if (executeUpdate) {
				let updated;
				[err, updated] = await to(
					Collection.update(updateContent, {
						where: {
							id: args.collectionId,
							authorId: context.user.id,
							public: false, // make sure the project was not public
							completed: false,
						},
					}),
				);
				success = updated[0];
			} else {
				success = true;
			}

			// catch any errors
			if (err) {
				errors.push({
					key: 'updateCollection',
					message: err,
				});
			}

			if (errors.length > 0) throw new ValidationError(errors);

			return { success };
		},

		/**
		 *	remove an existing collection
		 */
		async deleteCollection(parent, args, context) {
			const { user } = context;
			if (!user || user.profile.roleType === 'guest') return null;

			const errors = [];
			let err;
			let success = false;

			[err, success] = await to(
				Collection.destroy({
					where: {
						id: args.collectionId,
						authorId: context.user.id,
						public: false,
						completed: false,
					},
				}),
			);

			if (err) {
				errors.push({ key: 'deleteCollection', message: err });
			}

			if (errors.length > 0) throw new ValidationError(errors);

			return { success };
		},

		/**
		 *	add a product from a project
		 */
		async addCollectionItem(parent, args, context) {
			const { user } = context;
			if (!user || user.profile.roleType === 'guest') return null;

			const errors = [];
			let err;
			let success = false;

			[err, success] = await to(
				CollectionItem.findOrCreate({
					where: {
						CollectionID: args.collectionId,
						ItemID: args.itemId,
					},
				}).spread((createdProduct, created) => created),
			);

			if (err) {
				errors.push({
					key: 'addCollectionItem',
					message: err,
				});
			}

			if (errors.length > 0) throw new ValidationError(errors);
			return { success };
		},

		async deleteCollectionItem(parent, args, context) {
			const { user } = context;
			if (!user || user.profile.roleType === 'guest') return null;

			const errors = [];
			let err;
			let success = false;

			[err, success] = await to(
				CollectionItem.destroy({
					where: {
						CollectionID: args.collectionId,
						ItemID: args.itemId,
					},
				}),
			);

			if (err) {
				errors.push({
					key: 'deleteCollectionItem',
					message: err,
				});
			}
			if (errors.length > 0) throw new ValidationError(errors);
			return { success };
		},

		async addCollectionTag(parent, args, context) {
			const { user } = context;
			if (!user || user.profile.roleType === 'guest') return null;

			const errors = [];
			let err;
			let success = false;
			const { content, collectionId } = args;

			if (collectionId) {
				content.CollectionID = collectionId;
				[err, success] = await to(
					CollectionTag.findOrCreate({
						where: content,
					}).spread((createdProduct, created) => created),
				);
			}

			if (err) {
				errors.push({
					key: 'addCollectionTag',
					message: err,
				});
			}
			if (errors.length > 0) throw new ValidationError(errors);

			return { success };
		},

		async deleteCollectionTag(parent, args, context) {
			const { user } = context;
			if (!user || user.profile.roleType === 'guest') return null;

			const errors = [];
			let err;
			let success = false;
			const { content, collectionId } = args;

			if (collectionId) {
				content.CollectionID = collectionId;
				[err, success] = await to(
					CollectionTag.destroy({
						where: content,
					}),
				);
			}

			if (err) {
				errors.push({
					key: 'deleteCollectionTag',
					message: err,
				});
			}
			if (errors.length > 0) throw new ValidationError(errors);

			return { success };
		},
	},
};
