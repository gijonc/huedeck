import { combineReducers } from 'redux';

import loggedIn from './loggedIn';
import userDialog from './userDialog';
import alertbar from './alertbar';
import confirmDialog from './confirmDialog';
import paletteHistory from './paletteHistory';
import paletteData from './paletteData';
import cart from './cart';
import addedCartDialog from './addedCartDialog';
import progressBar from './progressBar';
import screenSize from './screenSize';
// import similarProduct from './similarProduct';

export default combineReducers({
	loggedIn,
	userDialog,
	alertbar,
	confirmDialog,
	paletteHistory,
	paletteData,
	cart,
	addedCartDialog,
	progressBar,
	screenSize,
});
