/* eslint-disable prefer-const */
/* eslint-disable camelcase */

/**
 *	Huedeck, Inc
 */

import { Collection, CollectionTag, UserProfile } from 'data/models';
import { Media, Inventory } from 'data/models/product';
import { to, ValidationError } from '../../utils';

export const schema = [
	`


	`,
];

export const queries = [
	`
	getPrivateCollection: [CollectionType]

	`,
];

export const resolvers = {
	RootQuery: {
		async getPrivateCollection(parent, args, context) {
			const { user } = context;
			if (!user || user.profile.roleType === 'guest') return null;

			const errors = [];
			let err;
			let collections = [];

			[err, collections] = await to(
				Collection.findAll({
					where: {
						authorId: context.user.id,
						completed: false,
						public: false,
					},
					order: [['updatedAt', 'DESC']],
					include: [
						{
							model: UserProfile,
							as: 'author',
							attributes: ['displayName', 'picture'],
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
							model: CollectionTag,
							as: 'tags',
						},
					],
				}).then(cl => {
					const result = cl;
					const len = result.length;
					for (let i = 0; i < len; i += 1) {
						if (result[i].palette) {
							result[i].palette = result[i].palette.split(',');
						}
					}
					return result;
				}),
			);

			if (err) {
				errors.push({
					key: 'getCollectionByAdmin',
					message: err,
				});
			}
			if (errors.length > 0) throw new ValidationError(errors);

			return collections;
		},
	},
};
