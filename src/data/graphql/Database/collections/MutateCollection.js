/* eslint-disable prefer-const */
/* eslint-disable camelcase */

/**
 *	Huedeck, Inc
 */

// import { Op } from 'sequelize';

import { User_saved_Collection } from 'data/models/relationships';
import { to, ValidationError } from '../../utils';

export const schema = [
	`
	type updateCollectionResult {
		success: Boolean!
	}

	`,
];

export const mutation = [
	`
	saveCollection(
		collectionId: String!
	): updateCollectionResult
	
	deleteSavedCollection(
		collectionId: String!
	): updateCollectionResult
	
	`,
];

export const resolvers = {
	Mutation: {
		async saveCollection(parent, args, context) {
			let success = false;

			if (!context.user) {
				return { success };
			}

			const errors = [];
			let err;

			[err, success] = await to(
				User_saved_Collection.findOrCreate({
					where: {
						UserID: context.user.id,
						CollectionID: args.collectionId,
					},
				}).then(result => result[1]),
			);

			if (err) {
				errors.push({
					key: 'saveCollection',
					message: err,
				});
			}

			if (errors.length > 0) throw new ValidationError(errors);
			return { success };
		},

		async deleteSavedCollection(parent, args, context) {
			let success = false;

			if (!context.user) {
				return { success };
			}

			const errors = [];
			let err;

			[err, success] = await to(
				User_saved_Collection.destroy({
					where: {
						UserID: context.user.id,
						CollectionID: args.collectionId,
					},
				}),
			);

			if (err) {
				errors.push({
					key: 'deleteSavedCollection',
					message: err,
				});
			}

			if (errors.length > 0) throw new ValidationError(errors);
			return { success };
		},
	},
};
