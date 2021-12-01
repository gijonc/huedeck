/**
 *	Huedeck, Inc
 */

import gql from 'graphql-tag';

export default {
	updateUserPassword: gql`
		mutation updateUserPassword(
			$oldPassword: String!
			$newPassword: String!
			$newPasswordConfirm: String!
		) {
			updateUserPassword(
				oldPassword: $oldPassword
				newPassword: $newPassword
				newPasswordConfirm: $newPasswordConfirm
			) {
				error {
					key
					message
				}
			}
		}
	`,

	updateUserProfile: gql`
		mutation updateUserProfile($content: UserProfileInput!) {
			updateUserProfile(content: $content) {
				error {
					key
					message
				}
			}
		}
	`,

	getLoggedInUserQuery: gql`
		query getLoggedInUserQuery {
			databaseGetLoggedInUser {
				emailAddress
				emailConfirmed
				profile {
					displayName
					roleType
					updatedAt
				}
				logins {
					name
				}

				updatedAt
				createdAt
			}
		}
	`,

	verifyUserEmail: gql`
		mutation verifyUserEmail {
			verifyUserEmail {
				error {
					key
					message
				}
			}
		}
	`,
};
