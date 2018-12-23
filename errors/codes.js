module.exports = {
	passportError: {
		userNotFound: {
			code: -0x10001,
			string: "passport:-1",
			message: "User was not found"
		},
		userOrPasswordInvalid: {
			code: -0x10002,
			string: "passport:-2",
			message: "User or password are invalid."
		},
		userAlreadyExists: {
			code: -0x10003,
			string: "passport:-3",
			message: "User already exists."
		},
		unexptedError: {
			code: -0x10004,
			string: "passport:-4",
			message: "There was an unexptected erro."
		},
		userLogged: {
			code: -0x10005,
			string: "passport:-5",
			message: "User is already logged."
		},
		userNotLogged: {
			code: -0x10006,
			string: "passport:-6",
			message: "User is not logged."
		},
		

	},
	dbError: {
		usernameInvalid: {
			code: -0x20001,
			string: "db:-1",
			message: "Provided username is invalid."
		},
		idInvalid: {
			code: -0x20002,
			string: "db:-2",
			message: "Provided id is invalid."
		}
	}
};
