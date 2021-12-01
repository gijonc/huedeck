/**
 * Huedeck, Inc.
 */

/* eslint-disable global-require */

//  FOR project page: https://github.com/kriasoft/react-starter-kit/issues/1390

// Admin: https://github.com/kriasoft/react-starter-kit/issues/1200

import notFound from './not-found';

const PRIVATE_ROUTES = ['user', 'savedlist', 'orders', 'oauth'];
function isRestrictedRoute(url, loggedIn) {
	const route = url.split('/')[1];
	const authedOnlyRoute = PRIVATE_ROUTES.indexOf(route) !== -1;
	if (authedOnlyRoute && !loggedIn) {
		return true;
	}
	return false;
}

const routes = {
  path: '/',

  children: [
    /** *************************************************************************
     * public routes
     */
    {
      path: '/',
      load: () => import(/* webpackChunkName: 'howItWorks' */ './howItWorks'),
    },

    {
      path: '/collections/:tagContent?',
      load: () => import(/* webpackChunkName: 'collectionList' */ './collectionList'),
    },

    {
      path: '/collection/:id',
      load: () => import(/* webpackChunkName: 'collectionPage' */ './collectionPage'),
    },

    {
      path: '/shop',
      load: () => import(/* webpackChunkName: 'shop' */ './shop'),
    },

    {
      path: '/room',
      load: () => import(/* webpackChunkName: 'room' */ './room'),
    },

    {
      path: '/style-quiz',
      load: () => import(/* webpackChunkName: 'styleQuiz' */ './styleQuiz'),
    },

    {
      path: '/scene/:id?',
      load: () => import(/* webpackChunkName: 'scene' */ './scene'),
    },

    // shop page with searches
    {
      path: '/products/:search?',
      load: () => import(/* webpackChunkName: 'catalog' */ './catalog'),
    },

    {
      path: '/brand/:brand',
      load: () => import(/* webpackChunkName: 'brand' */ './brand'),
    },

    {
      path: '/product/:pid',
      load: () => import(/* webpackChunkName: 'productPage' */ './productPage'),
    },

    {
      path: '/cart',
      load: () => import(/* webpackChunkName: 'cart' */ './cart'),
    },

    /** *************************************************************************
     * services routes
     */

    {
      path: '/account/:action',
      load: () => import(/* webpackChunkName: 'account' */ './account'),
    },

    {
      path: '/oauth/:method',
      load: () => import(/* webpackChunkName: 'oauth' */ './oauth'),
    },

    /** *************************************************************************
     * General User routes(login required)
     */
    {
      path: '/user/:action?',
      load: () => import(/* webpackChunkName: 'userProfile' */ './userProfile'),
    },

    {
      path: '/savedlist',
      load: () => import(/* webpackChunkName: 'savedList' */ './savedList'),
    },

    {
      path: '/orders',
      load: () => import(/* webpackChunkName: 'orderHistory' */ './orderHistory'),
    },

    /** *************************************************************************
     * static pages(documentations)
     */

    {
      path: '/about',
      load: () => import(/* webpackChunkName: 'about' */ './about'),
    },

    {
      path: '/demo',
      load: () => import(/* webpackChunkName: 'demo' */ './demo'),
    },

    /** *************************************************************************
     * authorized only routes
     */

    // Wildcard routes, e.g. { path: '(.*)', ... } (must go last)
    {
      path: '(.*)',
      load: () => import(/* webpackChunkName: 'not-found' */ './not-found'),
    },
  ],

  async action({ store, next, pathname }) {
    // Execute each child route until one of them return the result

    const route = await next();
    const { loggedIn } = store.getState();
    if (isRestrictedRoute(pathname, loggedIn)) {
      return notFound();
    }

    // Provide default values for title, description etc.
    route.title = `${route.title || 'Page Not Found'}`;
    route.description = route.description || '';

    return route;
  },
};

// The error page is available by permanent url for development mode
if (__DEV__) {
	routes.children.unshift({
		path: '/error',
		action: require('./error').default,
	});
}

export default routes;
