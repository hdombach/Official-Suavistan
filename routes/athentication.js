function check(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}

function checkNot(req, res, next) {
	if (req.isAuthenticated()) {
		return res.redirect('/');
	}
	next();
}

module.exports = { check, checkNot }