import jwt from 'jsonwebtoken';
import express from 'express';
import passport from './passport';
import config from './config';
import { ReE, ReS } from './expressHelper';

const router = express.Router();

/**
 * Log in / Sign up
 */

// signin with facebook Api
// fixing url bug by redirecting from Facebook login;
// https://stackoverflow.com/questions/7131909/facebook-callback-appends-to-return-url

router.post('/facebook', passport.authenticate('facebook'));
router.get('/facebook/return', passport.authenticate('facebook'), (req, res) => {
	const { expiresIn } = config.auth;
	const token = jwt.sign(req.user, config.auth.jwt.secret, { expiresIn });
	res.cookie(config.cookies.user, token, { maxAge: 1000 * expiresIn, httpOnly: true });
	res.redirect('/oauth/facebook');
});

// signin with Google Api
router.post('/google', passport.authenticate('google'));
router.get('/google/return', passport.authenticate('google'), (req, res) => {
	const { expiresIn } = config.auth;
	const token = jwt.sign(req.user, config.auth.jwt.secret, { expiresIn });
	res.cookie(config.cookies.user, token, { maxAge: 1000 * expiresIn, httpOnly: true });
	res.redirect('/oauth/google');
});

// signin with local user
router.post('/local', passport.authenticate('local'), (req, res) => {
	if (!req.user.id) {
		return ReE(res, { message: 'Unrecognized email or incorrect password' });
	}

	const { expiresIn } = config.auth;
	const token = jwt.sign(req.user, config.auth.jwt.secret, { expiresIn });
	res.cookie(config.cookies.user, token, { maxAge: 1000 * expiresIn, httpOnly: true });
	return ReS(res, { user: req.user });
});

router.post('/update-user', (req, res) => {
	try {
		const { user } = req.body;
		if (!req.user.id || req.user.id !== user.id) {
			return ReE(res, { message: 'Unauthorized request' });
		}
		// update user cookie, cookie timestamp must be removed before update
		delete user.iat;
		delete user.exp;
		const { expiresIn } = config.auth;
		const token = jwt.sign(user, config.auth.jwt.secret, { expiresIn });
		res.cookie(config.cookies.user, token, { maxAge: 1000 * expiresIn, httpOnly: true });
		return ReS(res);
	} catch (e) {
		return ReE(res, e);
	}
});

/**
 * LOG OUT
 */

router.post('/logout', (req, res) => {
	res.clearCookie(config.cookies.user);
	res.redirect('/');
});

/**
 * other Backend service && verification
 */

/*
router.post('/signup-verify', (req, res) => {
  const { secret, expiresIn, verifications } = config.accessCode;
  const { code } = req.body;
  const role = verifications[code];

  if (role) {
    const token = jwt.sign({ role }, secret, { expiresIn });
    res.cookie('sutk', token, { maxAge: 1000 * expiresIn, httpOnly: true });
    return ReS(res);
  }
  return ReE(res, { message: 'Invalid access code' });
});
*/

export default router;
