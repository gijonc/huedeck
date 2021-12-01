/**
 * Huedeck, Inc.
 */

// this file is for helper functions for security and error handling
import validator from 'validator';
import { GraphQLError } from 'graphql';
import config from '../../config';

const MIN_PASSWORD_LENGTH = 8;

function isValidPasswordInput(password, confirmPassowrd) {
	if (validator.isEmpty(password)) {
		return 'Please enter your password.';
	} else if (!validator.isLength(password, { min: MIN_PASSWORD_LENGTH })) {
		return `Password must be at least ${MIN_PASSWORD_LENGTH} alphabetical OR numerical characters (case sensitive).`;
	} else if (!validator.equals(password, confirmPassowrd)) {
		return 'Passwords do not match.';
	}
	return null;
}

// a handy wrapper for handling error when using await/async
function to(promise) {
	return promise.then(data => [null, data]).catch(err => [err]);
}

class ValidationError extends GraphQLError {
	constructor(errors) {
		super(errors[0].message);
		this.state = errors.reduce((res, error) => {
			const { key } = error;
			const result = res;
			if (Object.prototype.hasOwnProperty.call(result, key)) {
				result[key].push(error.message);
			} else {
				result[key] = [error.message];
			}
			return result;
		}, {});
	}
}

const validatorOptions = {
	email: {
		gmail_remove_dots: false,
		gmail_remove_subaddress: false,
		outlookdotcom_remove_subaddress: false,
		yahoo_remove_subaddress: false,
		icloud_remove_subaddress: false,
	},
};

// use this everytime using a shopify api call
async function clearShopifyApiCallTraffic() {
	const { SHOPIFY_API_CALL_REMAINING } = global;
	if (SHOPIFY_API_CALL_REMAINING < 10) {
		console.warn(`current shopify API call remaining: ${SHOPIFY_API_CALL_REMAINING}`);
		if (SHOPIFY_API_CALL_REMAINING < 3) {
			// break the call if < 3
			return false;
		}
		// wait for 5 seconds
		await new Promise(r => {
			setTimeout(r, 5000);
		});
	}
	return true;
}

function getValidGuest(context) {
	if (
		(!context.user || !context.cookies[config.cookies.user]) &&
		context.cookies[config.cookies.guest]
	) {
		const clientId = context.cookies[config.cookies.guest];
		// const clientId = jwt.verify(token, config.auth.jwt.secret, (err, decoded) => {
		// 	if (err) return null;
		// 	return decoded.clientId;
		// });
		return clientId || null;
	}
	return null;
}

export {
	validator,
	validatorOptions,
	ValidationError,
	to,
	isValidPasswordInput,
	clearShopifyApiCallTraffic,
	getValidGuest,
};
