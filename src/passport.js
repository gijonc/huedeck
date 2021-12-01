/**
 * Huedeck, Inc.
 */

/**
 * Passport.js reference implementation.
 * The database schema used in this sample is available at
 * https://github.com/membership/membership.db/tree/master/postgres
 */

import passport from 'passport';

import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GoogleStrategy } from '@passport-next/passport-google-oauth2';
import { Strategy as LocalStrategy } from 'passport-local';
import { User, UserLogin, UserClaim, UserProfile, UserPreference } from './data/models';
import { to, validator, validatorOptions } from './data/graphql/utils';

import config from './config';

// https://github.com/kriasoft/nodejs-api-starter/blob/master/src/passport.js

passport.serializeUser((user, done) => {
	done(null, {
		id: user.id,
		profile: user.profile,
	});
});

passport.deserializeUser((user, done) => {
	done(null, user);
});

const defaultInclude = [
	{ model: UserProfile, as: 'profile' },
	{
		model: UserPreference,
		as: 'preference',
		attributes: ['budget', 'color', 'roomType', 'style', 'colorMood'],
	},
];

const defaultReturn = user => ({
	id: user.id,
	profile: user.profile,
	preference: user.preference || {},
});

async function login(req, provider, profile, tokens) {
	let _imageUrl = '';

	// get profile picture url
	if (provider === 'facebook') {
		_imageUrl = `https://graph.facebook.com/${profile.id}/picture?type=large`;
	} else if (provider === 'google') {
		_imageUrl = profile.photos[0].value;
	}

	if (req.user) {
		const userLogin = await UserLogin.findOne({
			attributes: ['name', 'key'],
			where: { name: profile.provider, key: profile.id },
		});
		if (userLogin) {
			console.log(`user has logged in with ${provider}`);

			// There is already a Google account that belongs to you.
			// Sign in with that account or delete it, then link it with your current account.
			return;
		}
		console.log(`user NOT log in with ${provider}, create it now`);

		const user = await User.create(
			{
				id: req.user.id,
				emailAddress: profile.emails[0].value,
				logins: [
					{
						name: profile.provider,
						key: profile.id,
					},
				],

				claims: [
					{
						type: `urn:${profile.provider}:access_token`,
						value: profile.id,
					},
				],

				profile: {
					displayName: profile.displayName,
					picture: _imageUrl,
				},
			},
			{
				include: [
					{ model: UserLogin, as: 'logins' },
					{ model: UserClaim, as: 'claims' },
					...defaultInclude,
				],
			},
		);

		return {
			thirdPartyLogin: provider,
			...defaultReturn(user),
		};
	}
	// user not Login with any ways
	console.log('[PASSPORT]: User NOT Login ->');
	const users = await User.findAll({
		attributes: ['id', 'emailAddress'],
		where: {
			'$logins.name$': profile.provider,
			'$logins.key$': profile.id,
		},

		include: [
			{
				attributes: ['name', 'key'],
				model: UserLogin,
				as: 'logins',
				required: true,
			},
			...defaultInclude,
		],
	});

	if (users.length) {
		console.log(`User has an account with ${profile.provider}`);

		const user = users[0].get({ plain: true });

		return {
			thirdPartyLogin: provider,
			...defaultReturn(user),
		};
	}
	let user = await User.findOne({
		where: {
			emailAddress: profile.emails[0].value,
		},
		include: defaultInclude,
	});

	if (user) {
		// TODO: ask user if override with this provider account
		// There is already an account using this email address. Sign in to
		// that account and link it with this provider manually from Account Settings.
		console.log(`User has an account with ${profile.provider} email`);

		return defaultReturn(user);
	}
	console.log(`Creating an user account with ${profile.provider}`);

	user = await User.create(
		{
			emailAddress: profile.emails[0].value,
			emailConfirmed: true,
			logins: [{ name: profile.provider, key: profile.id }],
			claims: [
				{
					type: `urn:${profile.provider}:access_token`,
					value: profile.id,
				},
			],
			profile: {
				displayName: profile.displayName,
				picture: _imageUrl,
			},
		},
		{
			include: [
				{ model: UserLogin, as: 'logins' },
				{ model: UserClaim, as: 'claims' },
				...defaultInclude,
			],
		},
	);
	return {
		thirdPartyLogin: provider,
		...defaultReturn(user),
	};
}

/**
 * Third Party Oauth strategies
 */

passport.use(
	new FacebookStrategy(
		{
			clientID: config.auth.facebook.id,
			clientSecret: config.auth.facebook.secret,
			callbackURL: '/auth/facebook/return',
			profileFields: [
				'id',
				'email',
				'gender',
				'link',
				'locale',
				'name',
				'timezone',
				'updated_time',
				'verified',
			],
			scope: ['email'],
			passReqToCallback: true,
			failureRedirect: '/',
			session: false,
		},
		async (req, accessToken, refreshToken, profile, done) => {
			try {
				if (profile.emails.length) profile.emails[0].verified = !!profile._json.verified;
				profile.displayName =
					profile.displayName || `${profile.name.givenName} ${profile.name.familyName}`;

				const user = await login(req, 'facebook', profile, {
					accessToken,
					refreshToken,
				});

				done(null, user);
			} catch (err) {
				done(err);
			}
		},
	),
);

passport.use(
	new GoogleStrategy(
		{
			clientID: config.auth.google.id,
			clientSecret: config.auth.google.secret,
			callbackURL: '/auth/google/return',
			scope: ['email'],
			passReqToCallback: true,
			failureRedirect: '/',
			session: false,
		},
		async (req, accessToken, refreshToken, profile, done) => {
			if (!profile.displayName) profile.displayName = profile.emails[0].value.split('@')[0];
			try {
				const user = await login(req, 'google', profile, {
					accessToken,
					refreshToken,
				});

				done(null, user);
			} catch (err) {
				done(err);
			}
		},
	),
);

passport.use(
	new LocalStrategy(
		{
			// by default, local strategy uses username and password, we will override with email
			usernameField: 'email',
			passwordField: 'password',
			passReqToCallback: true,
			session: false,
		},
		async (req, email, password, done) => {
			const [err, result] = await to(
				User.findOne({
					where: {
						emailAddress: validator.normalizeEmail(email, validatorOptions.email),
					},
					include: defaultInclude,
				}).then(async user => {
					if (user) {
						const pass = await user.verifyPassword(password);
						return pass ? defaultReturn(user) : null;
					}
					return null;
				}),
			);

			if (err) {
				return done(err);
			}
			if (!result) {
				return done(null, {});
			}

			done(null, result);
		},
	),
);

export default passport;
