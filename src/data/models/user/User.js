/**
 * Huedeck, Inc
 */

import bcrypt from 'bcryptjs';
import DataType from 'sequelize';
import shopifyApi from '../../graphql/Api/shopify/buySdk';
import { UserCart } from '../cart';
import emailHelper from '../../serverTools/emailHelper';
import Model from '../../sequelize';
import UserProfile from './UserProfile';

const User = Model.define('User', {
	id: {
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
		primaryKey: true,
		unique: true,
	},

	passwordHash: {
		type: DataType.STRING,
		allowNull: true, //  allow users to login with third party ids
	},

	emailAddress: {
		type: DataType.STRING,
		allowNull: false,
		unique: true,
	},

	// comfirm that the email address belongs to the user (e.g., verify by sending an email)
	emailConfirmed: {
		type: DataType.BOOLEAN,
		defaultValue: false,
	},

	// other user seciruity data
	/*		
		accessFailedCount: {
			type: DataType.INTEGER,
			defaultValue: 0,
		},

		lockoutEnd: {
			type: DataType.DATE,
			allowNull: true,
		},

		lockout_enabled: {
			type: DataType.BOOLEAN,
			defaultValue: false,
		}
*/
});

/* eslint-disable func-names */
User.prototype.verifyPassword = async function(inputPassword) {
	let pass = false;
	if (this.passwordHash && inputPassword) {
		try {
			pass = await bcrypt.compare(inputPassword, this.passwordHash);
		} catch (err) {
			console.error(err.message);
		}
	}
	return pass;
};

async function hash(rawPassword) {
	/*
	 * hash password before create
	 * hashing with Bcrypt: https://www.npmjs.com/package/bcrypt
	 * Note: here uses 10 rounds salt, which allows ~10 hashes/sec
	 */
	try {
		const salt = await bcrypt.genSalt(10);
		return await bcrypt.hash(rawPassword, salt);
	} catch (err) {
		throw new Error(`Error in hashing password -> ${err.message}`);
	}
}

/**
 *  create user
 */

User.beforeCreate(async _user => {
	const user = _user;
	// password is not needed for third part login
	if (user.passwordHash) {
		user.passwordHash = await hash(user.passwordHash);
	}
});

User.afterCreate(async user => {
	// create checkout for user from shopify API

	try {
		const checkout = await shopifyApi.createCheckout({
			email: user.emailAddress,
		});

		// get checkout token from shopify checkout api
		// this will be matched with the returned checkout_token in Order webhook
		//   const checkoutId = checkout.webUrl.match('checkouts/(.*)\\?key')[1];
		await UserCart.create({
			checkoutId: checkout.id,
			UserID: user.id,
		});

		// filter out test emails
		if (user.emailAddress.split('@')[1] !== 'test.com') {
			emailHelper.verfiyUserEmail(user);
		}
	} catch (err) {
		console.error(err.message);
	}
});

/**
 * update user
 */

User.beforeBulkUpdate(async user => {
	// hash password before update
	const { attributes } = user;
	if (attributes.passwordHash) {
		attributes.passwordHash = await hash(attributes.passwordHash);
	}
});

User.afterBulkUpdate(async update => {
	const { fields, where } = update;

	// send email notification to user if password get updated;
	if (where.id && fields.indexOf('passwordHash') !== -1) {
		const user = await User.findOne({
			attributes: ['emailAddress'],
			where,
			include: [
				{
					attributes: ['displayName'],
					model: UserProfile,
					as: 'profile',
				},
			],
		});

		if (user) {
			emailHelper.updatePasswordNotice(user);
		}
	}
});

export default User;
