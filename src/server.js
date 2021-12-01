/**
 *	Huedeck, Inc
 */

// uncomment following for local (Dev testing only)!!
// import dotenv from 'dotenv';
// dotenv.config();

/**
 *	 serverside packages
 */
import path from 'path';
import Promise from 'bluebird';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import expressJwt, { UnauthorizedError as Jwt401Error } from 'express-jwt';
import { graphql } from 'graphql';
import expressGraphQL from 'express-graphql';
import nodeFetch from 'node-fetch';
import compression from 'compression';
import React from 'react';
import ReactDOM from 'react-dom/server';
import { getDataFromTree } from 'react-apollo';
import PrettyError from 'pretty-error';
import validator from 'validator';
import createApolloClient from './core/createApolloClient';
import App from './components/App';
import Html from './components/Html';
import { ErrorPageWithoutStyle } from './routes/error/ErrorPage';
import errorPageStyle from './routes/error/ErrorPage.css';
import createFetch from './createFetch';
import passport from './passport';
import router from './router';
import models from './data/models';
import schema from './data/schema';
import sequelize from './data/sequelize'; // debug purpose
import { generateUUID } from './expressHelper';
// api routes
import shopify from './data/graphql/Api/shopify/config';
import shopifyWebhook from './shopify';
import auth from './auth';
import visionAi from './visionAi';
// import assets from './asset-manifest.json'; // eslint-disable-line import/no-unresolved
import chunks from './chunk-manifest.json'; // eslint-disable-line import/no-unresolved
import configureStore from './store/configureStore';
import config from './config';

process.on('unhandledRejection', (reason, p) => {
	console.error('Unhandled Rejection at:', p, 'reason:', reason);
	// send entire app down. Process manager will restart it
	process.exit(1);
});

//
// Tell any CSS tooling (such as Material UI) to use all vendor prefixes if the
// user agent is not known.
// -----------------------------------------------------------------------------
global.navigator = global.navigator || {};
global.navigator.userAgent = global.navigator.userAgent || 'all';

const app = express();
app.use(compression());
//
// If you are using proxy from external machine, you can set TRUST_PROXY env
// Default is to trust proxy headers only from loopback interface.
// -----------------------------------------------------------------------------
app.enable('trust proxy');
app.set('trust proxy', config.trustProxy);

// redirect all unsecure request (non-https) to https ONLY for production mode
if (!__DEV__ && config.staticIP && config.api.clientUrl) {
	app.use((req, res, next) => {
		// parse host from port
		const reqHost = req.headers.host.split(':')[0];
		const reqUrl = req.originalUrl || req.url;

		// if host is an IP addresss:
		if (validator.isIP(reqHost, 4)) {
			// if req ip is domain's static ip, force redirect ->
			if (reqHost === config.staticIP) {
				return res.redirect(301, config.api.clientUrl + reqUrl);
			}
			return next();
		}
		// if host is not an IP address:

		// force redirect from non-www to www ->
		if (req.headers.host.match(/^www/) === null) {
			return res.redirect(301, config.api.clientUrl + reqUrl);
		}

		// force redirect from non-https to https ->
		let isHttps = req.secure;
		if (!isHttps) {
			isHttps = (req.headers['x-forwarded-proto'] || '').substring(0, 5) === 'https';
		}

		if (isHttps) {
			return next();
		} else if (req.method === 'GET' || req.method === 'HEAD') {
			return res.redirect(301, config.api.clientUrl + reqUrl);
		}
		return res.status(403).send('forbidden');
	});
}

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
app.use(express.static(path.resolve(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(bodyParser.json({ limit: '10mb' }));

//
// Authentication
// -----------------------------------------------------------------------------
app.use(
	expressJwt({
		secret: config.auth.jwt.secret,
		credentialsRequired: false,
		getToken: req => req.cookies[config.cookies.user],
	}),
);

// Error handler for express-jwt
app.use((err, req, res, next) => {
	// eslint-disable-line no-unused-vars
	if (err instanceof Jwt401Error) {
		console.error('[express-jwt-error]', req.cookies[config.cookies.user]);
		// `clearCookie`, otherwise user can't use web-app until cookie expires
		res.clearCookie(config.cookies.user);
	}
	next(err);
});

app.use(passport.initialize());

// setup a listener that monistors shopify API call events,
// keep track of the remaining call number and save it to a global variable,
// this helps to prevent breaking the shopify api call limit
global.SHOPIFY_API_CALL_REMAINING = 40; // MAX = 40
// eslint-disable-next-line no-return-assign
shopify.api.on('callLimits', limits => (global.SHOPIFY_API_CALL_REMAINING = limits.remaining));

// routes for shopify API
app.use(
	'/shopify',
	(req, res, next) => {
		// TODO: verify shopify hmac
		if (req.get('x-shopify-shop-domain') !== config.myShopify.domain) {
			res.sendStatus(404);
		} else {
			next();
		}
	},
	shopifyWebhook,
);

app.use('/auth', auth);

app.use('/vision-ai', visionAi);

// assign a client id to the user (for guest checkout), valid for 90 days
app.use((req, res, next) => {
	if (!req.cookies[config.cookies.guest]) {
		const clientId = generateUUID();
		const expiresIn = 7776000; // 90 days ( < shopify checkoutId expiration)
		// const token = jwt.sign({clientId}, config.auth.jwt.secret, { expiresIn });
		res.cookie(config.cookies.guest, clientId, {
			maxAge: 1000 * expiresIn,
			httpOnly: true,
		});
	}
	next();
});
//
// Register API middleware
// -----------------------------------------------------------------------------
// https://github.com/graphql/express-graphql#options
const graphqlMiddleware = expressGraphQL(req => ({
	schema,
	graphiql: __DEV__,
	//   context: {req, res},
	rootValue: { request: req },
	pretty: __DEV__,

	// define GraphQL return error type
	formatError: error => ({
		message: error.message,
		state: error.originalError && error.originalError.state,
		locations: error.locations,
		path: error.path,
	}),
}));

// TODO: secure/restrict /graphql route from external access/request
app.use('/graphql', graphqlMiddleware);

//
// Register server-side rendering middleware
// -----------------------------------------------------------------------------
app.get('*', async (req, res, next) => {
	try {
		const css = new Set();

		// Enables critical path CSS rendering
		// https://github.com/kriasoft/isomorphic-style-loader
		const insertCss = (...styles) => {
			// eslint-disable-next-line no-underscore-dangle
			styles.forEach(style => css.add(style._getCss()));
		};

		const apolloClient = createApolloClient({
			schema,
			rootValue: { request: req },
			formatError: error => ({
				message: error.message,
				state: error.originalError && error.originalError.state,
				locations: error.locations,
				path: error.path,
			}),
		});

		// Universal HTTP client
		const fetch = createFetch(nodeFetch, {
			baseUrl: config.api.serverUrl,
			cookie: req.headers.cookie,
			schema,
			graphql,
		});

		const initialState = {
			loggedIn: req.user || null,
		};

		const store = configureStore(initialState, {
			client: apolloClient,
			cookie: req.headers.cookie,
			fetch,
			// I should not use `history` on server.. but how I do redirection? follow universal-router
			history: null,
		});

		// Global (context) variables that can be easily accessed from any React component
		// https://facebook.github.io/react/docs/context.html
		const context = {
			insertCss,
			fetch,
			// The twins below are wild, be careful!
			pathname: req.path,
			query: req.query,
			// You can access redux through react-redux connect
			store,
			storeSubscription: null,
			// Apollo Client for use with react-apollo
			client: apolloClient,
		};

		const route = await router.resolve(context);

		if (route.redirect) {
			res.redirect(route.status || 302, route.redirect);
			return;
		}

		const data = { ...route };
		const rootComponent = <App context={context}>{route.component}</App>;
		await getDataFromTree(rootComponent);
		// this is here because of Apollo redux APOLLO_QUERY_STOP action
		await Promise.delay(0);
		data.children = await ReactDOM.renderToString(rootComponent);
		data.styles = [{ id: 'css', cssText: [...css].join('') }];

		const scripts = new Set();
		const addChunk = chunk => {
			if (chunks[chunk]) {
				chunks[chunk].forEach(asset => scripts.add(asset));
			} else if (__DEV__) {
				throw new Error(`Chunk with name '${chunk}' cannot be found`);
			}
		};
		addChunk('client');
		if (route.chunk) addChunk(route.chunk);
		if (route.chunks) route.chunks.forEach(addChunk);
		data.scripts = Array.from(scripts);

		// Furthermore invoked actions will be ignored, client will not receive them!

		data.app = {
			apiUrl: config.api.clientUrl,
			state: context.store.getState(),
			apolloState: context.client.extract(),
		};

		const html = ReactDOM.renderToStaticMarkup(<Html {...data} />);
		res.status(route.status || 200);
		res.send(`<!doctype html>${html}`);
	} catch (err) {
		next(err);
	}
});

//
// Error handling
// -----------------------------------------------------------------------------
const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage('express');

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
	console.error(pe.render(err));
	const html = ReactDOM.renderToStaticMarkup(
		<Html
			title="Internal Server Error"
			description={err.message}
			styles={[{ id: 'css', cssText: errorPageStyle._getCss() }]} // eslint-disable-line no-underscore-dangle
		>
			{ReactDOM.renderToString(<ErrorPageWithoutStyle error={err} />)}
		</Html>,
	);
	res.status(err.status || 500);
	res.send(`<!doctype html>${html}`);
});

// check DATABASE connection
sequelize
	.authenticate()
	.then(() => {
		// eslint-disable-next-line no-console
		console.info(
			`\n* Connected to [${config.db.dialect}] db '${config.db.name}' at '${config.db.host}:${
				config.db.port
			}'`,
		);
	})
	.catch(err => {
		// eslint-disable-next-line no-console
		console.error(
			`\nFAILED to connected to [${config.db.dialect}] db '${config.db.name}' at '${
				config.db.host
			}:${config.db.port}'\n`,
			`\n${err}`,
		);
	});

//
// Launch the server
// -----------------------------------------------------------------------------
const promise = models.sync().catch(err => console.error(err.stack));
if (!module.hot) {
	promise.then(() => {
		app.listen(config.port, () => {
			console.info(`* The server is running at localhost:${config.port}/`);
		});
	});
}

//
// Hot Module Replacement
// -----------------------------------------------------------------------------
if (module.hot) {
	app.hot = module.hot;
	module.hot.accept('./router');
}

export default app;
