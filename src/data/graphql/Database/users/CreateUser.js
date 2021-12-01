/**
 *	Huedeck, Inc
 */

import { User, UserProfile, UserPreference } from '../../../models';
import { isValidPasswordInput, to, validatorOptions, validator } from '../../utils';
// import shopify from '../../Api/shopify/config';

export const schema = [
	`
  input UserProfileInput {
    displayName: String
  }

  input UserPreferenceInput {
	  roomType: String!
	  budget: [Float!]
	  color: [String!]
	  style: [String!]
	  colorMood: [String!]
  }

  type _ErrorType {
	 key: String!
	 message: String!
  }

  type MutateUserResult {
	 error: _ErrorType
  }
`,
];

export const mutation = [
	`
  databaseCreateUser(
	 emailAddress: String!
	 password: String!
	 confirmPassword: String!
	 profile: UserProfileInput
	 preference: UserPreferenceInput
  ): MutateUserResult

#  createDiscountCode(
#	  email: String!
#  ): Boolean!

`,
];

async function validNewUser(input) {
	// check email
	if (validator.isEmpty(input.emailAddress)) {
		return {
			key: 'emailAddress',
			message: 'Please enter your email address',
		};
	} else if (!validator.isEmail(input.emailAddress)) {
		return {
			key: 'emailAddress',
			message: 'Invalid email address',
		};
	}
	const [err, existUser] = await to(
		User.findOne({
			where: { emailAddress: input.emailAddress },
		}),
	);
	if (err) {
		console.error(err.message);
		return {
			key: 'sysError',
			message: err.message,
		};
	} else if (existUser) {
		return {
			key: 'emailAddress',
			message: 'This email address has been registered.',
		};
	}

	// check password
	const validPswRes = isValidPasswordInput(input.password, input.confirmPassword);
	if (typeof validPswRes === 'string') {
		return {
			key: 'password',
			message: validPswRes,
		};
	}

	return null;
}

export const resolvers = {
	Mutation: {
		async databaseCreateUser(parent, args) {
			let createUserError = await validNewUser(args);

			// try creating user to database
			if (!createUserError) {
				const createUser = {
					emailAddress: validator.normalizeEmail(args.emailAddress, validatorOptions.email),
					passwordHash: args.password,
					profile: {},
				};

				// pre-process
				if (args.profile) {
					Object.keys(args.profile).forEach(key => {
						if (typeof args.profile[key] === 'string')
							createUser.profile[key] = args.profile[key].trim().toLowerCase();
					});
				} else {
					// make default username to be the prefix of user's email address
					createUser.profile.displayName = createUser.emailAddress.split('@')[0];
				}

				if (args.preference) {
					createUser.preference = args.preference;
				}

				try {
					const success = await User.create(createUser, {
						include: [
							{ model: UserProfile, as: 'profile' },
							{ model: UserPreference, as: 'preference' },
						],
					}).then(result => Boolean(result));
					if (!success) {
						createUserError = {
							key: 'sysError',
							message: 'Failed to create user',
						};
					}
				} catch (err) {
					throw err.message;
				}
			}

			return {
				error: createUserError,
			};
		},

		/*
    async createDiscountCode(parent, args) {
      try {
        const customers = await shopify.api.customer.search({ query: `email:${args.email}` });
        if (customers.length) {
          const priceRuleId = 378370883702;

			 // To create a new price rule

          //	 const codeName = 'SIGNUP10OFF';
          //
          //  const now = new Date();
          //  const { id } = customers[0];
          //  const priceRuleParams = {
          //    title: codeName,
          //    target_type: 'line_item',
          //    target_selection: 'all',
          //    allocation_method: 'across',
          //    value_type: 'percentage',
          //    value: '-10.0',
          //    once_per_customer: true,
          //    customer_selection: 'prerequisite',
          //    prerequisite_customer_ids: [id],
          //    starts_at: now.toISOString(),
          //  };
          //  const priceRule = await shopify.api.priceRule.create(priceRuleParams);
          //  const discountCode = await shopify.api.discountCode.create(priceRuleId, {
          //		code: codeName
          //	 });

			 // To add a customer from Shopify to discount list
          const { prerequisite_customer_ids } = await shopify.api.priceRule.get(priceRuleId);
          if (prerequisite_customer_ids.indexOf(id) === -1) {
            prerequisite_customer_ids.push(id);
            await shopify.api.priceRule.update(priceRuleId, {
              prerequisite_customer_ids,
            });
          }
        }
      } catch (e) {
        console.error(e);
        throw e.message;
      }
      return true;
	 },
*/
	},
};
