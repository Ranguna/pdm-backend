module.exports = {
	passportError: {
		userNotFound: {
			code: -0x10001,
			string: "passport:-1",
			message: "User was not found"
		},
		emailOrPasswordInvalid: {
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
		emailInvalid: {
			code: -0x20001,
			string: "db:-1",
			message: "Provided email is invalid."
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
			message: "The provided email does not match any user."
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
		noEmailProvided: {
			code: -0x30005,
			string: "account:-5",
			message: "A email was not providede."
		},
	},
	boleiaErrors: {
		unexptedError: {
			code: -0x40001,
			string: "boleia:-1",
			message: "There was an unexptected erro."
		},
		invalidRequestBody: {
			code: -0x40002,
			string: "boleia:-2",
			message: "Provided request body is invalid."
		},
		invalidBoleiaId: {
			code: -0x40003,
			string: "boleia:-3",
			message: "Invalid boleia Id."
		},
		invalidUserId: {
			code: -0x40004,
			string: "boleia:-4",
			message: "Invalid user Id."
		},
		boleiaIsFull: {
			code: -0x40005,
			string: "boleia:-5",
			message: "Boleia is full."
		},
		userAlreadyInBoleia: {
			code: -0x40006,
			string: "boleia:-6",
			message: "The current user is already in Boleia."
		},
		couldnHitchhike: {
			code: -0x40007,
			string: "boleia:-7",
			message: "User was not registered on Boleia."
		},
		userNotOwner: {
			code: -0x40008,
			string: "boleia:-8",
			message: "Denied, user is not owner of boleia."
		},
		boleiaNotCanceled: {
			code: -0x40009,
			string: "boleia:-9",
			message: "Boleia was not canceled."
		},
		boleiaNotuncanceled: {
			code: -0x40010,
			string: "boleia:-10",
			message: "Boleia was not uncanceled."
		},
		userNotInBoleia: {
			code: -0x40011,
			string: "boleia:-11",
			message: "User is not in Boleia."
		},
		couldntCancelHitch: {
			code: -0x40012,
			string: "boleia:-12",
			message: "Hitchhike was not canceled."
		},
		boleiaCanceled: {
			code: -0x40013,
			string: "boleia:-13",
			message: "Denied, boleia is canceled."
		}
	}
};
