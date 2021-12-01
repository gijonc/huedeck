/**
 *	Huedeck, Inc
 */

if (process.env.BROWSER) {
	throw new Error('Do not import `config.js` from inside the client-side code.');
}

module.exports = {
	// Node.js app
	port: process.env.PORT || 3000,

	host: process.env.HOST || 'localhost',

	staticIP: process.env.STATIC_IPv4,

	// https://expressjs.com/en/guide/behind-proxies.html
	trustProxy: process.env.TRUST_PROXY || ['loopback', 'linklocal', '192.168.1.69'],

	accessCode: {
		secret: 'accessCode+jwt-token+ecK4fT9ez5Pg4x14l9d0',
		expiresIn: 600,
		verifications: {
			[process.env.ACCESS_CODE_FOR_GUEST || '123']: 'guest',
			[process.env.ACCESS_CODE_FOR_INVITED || '456']: 'invited',
		},
	},
	// API Gateway
	api: {
		// API URL to be used in the client-side code
		clientUrl: process.env.API_CLIENT_URL || `http://localhost:${process.env.PORT || 3000}`,
		// API URL to be used in the server-side code
		serverUrl: process.env.API_SERVER_URL || `http://localhost:${process.env.PORT || 3000}`,
		// PALETTE GENERATOR API Service Server IP
		paletteGeneratorIp: process.env.API_PALETTE_GENERATOR_IP || 'http://localhost:9000',
	},

	// Database
	db: {
		name: process.env.DB_NAME || 'huedeck-dev',
		username: process.env.DB_USERNAME || 'root',
		password: process.env.DB_PASSWORD || 'root',
		host: process.env.DB_HOST || 'localhost',
		dialect: process.env.DB_DIALECT || 'mysql',
		port: process.env.DB_PORT || '3306',
	},

	myShopify: {
		domain: 'huedeck.myshopify.com',
		key: '75609b40da9cfd951b7a44750dd9827b',
		secret: 'ec0c028d0b89d0ad0b1f0f0cc2fa859d',
		storefrontAccessToken: '54587253c7a2290d85477c344b34515e',
	},

	// cookies
	cookies: {
		user: process.env.USER_COOKIE_KEY || '_uidtk',
		guest: process.env.USER_COOKIE_KEY || '_gcoid',
	},

	// Authentication
	auth: {
		jwt: { secret: process.env.AUTH_JWT_SECRET || 'jwt-token+ecK4fT9ez5Pg4x14l9d0' }, // be unexpected !!!
		expiresIn: Number(process.env.AUTH_EXPIRES_IN) || 15552000, // 180 days

		// Third party OAuth login
		facebook: {
			id: process.env.FACEBOOK_APP_ID || '2107244496170672',
			secret: process.env.FACEBOOK_APP_SECRET || '5c9a905d67d40160cc1fd24e87ca9431',
		},

		google: {
			id:
				process.env.GOOGLE_CLIENT_ID ||
				'970012139268-0s564kel5e0c6rill8kpu8en77m7cljk.apps.googleusercontent.com',
			secret: process.env.GOOGLE_CLIENT_SECRET || '-USDXaoLXDZoNGWkHfHaKVle',
		},
	},

	// Web analytics (must under production env)
	analytics: {
		googleTrackingId: process.env.GOOGLE_TRACKING_ID,
		facebookPixelId: process.env.FACEBOOK_PIXEL_ID,
	},
};
