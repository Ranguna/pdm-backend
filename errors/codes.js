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
		accountDeactivated: {
			code: -0x10007,
			string: "passport:-7",
			message: "Denied, account is deactivated."
		}
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
		},
		invalidData: {
			code: -0x20003,
			string: "db:-3",
			message: "Provided data is invalid."
		},
		invalidPassword: {
			code: -0x20004,
			string: "db:-4",
			message: "The provided password is invalid."
		},
		userNotFound: {
			code: -0x20005,
			string: "db:-5",
			message: "The provided username does not match any user."
		},
	},
	accountErrors: {
		invalidRequestBody: {
			code: -0x30001,
			string: "account: -1",
			message: "Provided request body is invalid."
		},
		unexptedError: {
			code: -0x30002,
			string: "account:-2",
			message: "There was an unexptected erro."
		},
		invalidNomeFormatting: {
			code: -0x30003,
			string: "account:-3",
			message: "Invalid format for 'nome'."
		},
		invalidPasswordFormatting: {
			code: -0x30004,
			string: "account:-4",
			message: "Invalid format for 'password'."
		},
		noUsernameProvided: {
			code: -0x30005,
			string: "account:-5",
			message: "A username was not providede."
		},
	}
};
