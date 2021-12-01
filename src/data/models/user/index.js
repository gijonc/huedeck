/* eslint-disable import/prefer-default-export */

import User from './User';
import UserLogin from './UserLogin';
import UserClaim from './UserClaim';
import UserProfile from './UserProfile';
import UserOrder from './UserOrder';
import UserPreference from './UserPreference';
import UserVerificationCode from './UserVerificationCode';

User.hasMany(UserLogin, {
	foreignKey: 'UserID',
	as: 'logins',
	onUpdate: 'cascade',
	onDelete: 'cascade',
});

User.hasMany(UserClaim, {
	foreignKey: 'UserID',
	as: 'claims',
	onUpdate: 'cascade',
	onDelete: 'cascade',
});

User.hasMany(UserOrder, {
	foreignKey: 'UserID',
	as: 'orders',
	onUpdate: 'cascade',
	onDelete: 'cascade',
});

User.hasMany(UserVerificationCode, {
	foreignKey: 'UserID',
	as: 'verificationCode',
	onUpdate: 'cascade',
	onDelete: 'cascade',
});

User.hasOne(UserProfile, {
	foreignKey: 'UserID',
	as: 'profile',
	onUpdate: 'cascade',
	onDelete: 'cascade',
});

User.hasOne(UserPreference, {
	foreignKey: 'UserID',
	as: 'preference',
	onUpdate: 'cascade',
	onDelete: 'cascade',
});

export { User, UserLogin, UserClaim, UserProfile, UserOrder, UserVerificationCode, UserPreference };
