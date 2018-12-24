module.exports = {
	user: /^[\p{L} ]+$/u,
	password: /^(?=.*[a-z]+)(?=.*[A-Z]+)(?=.*\d+)(?=.*[^a-zA-Z0-9\u0000-\u001F\u0080-\u00A0]+)[^\u0000-\u001F\u0080-\u00A0]{8,100}$/u
};
