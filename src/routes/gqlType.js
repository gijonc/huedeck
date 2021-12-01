/**
 *	Huedeck, Inc
 */

import gql from 'graphql-tag';

export default {
	/** ******************************************
	 *	Product & Color
	 */

	getTopSellerProduct: gql`
		query getTopSellerProduct($priorOrder: [String!]) {
			getTopSellerProduct(priorOrder: $priorOrder) {
				ProductID
				minPrice
				maxPrice
				image
				productName
				variants {
					price
					msrpPrice
				}
			}
		}
	`,

	getSimilarProducts: gql`
		query getSimilarProducts(
			$activeColors: [[Int!]!]!
			$filters: String!
			$excludeProductIds: [String!]
			$lastOffset: Int!
		) {
			getSimilarProducts(
				activeColors: $activeColors
				excludeProductIds: $excludeProductIds
				lastOffset: $lastOffset
				filters: $filters
			) {
				newOffset
				totalCount
				products {
					ProductID
					productName
					category3
					minPrice
					maxPrice
					image
					colors {
						hexCode
					}
					variants {
						price
						msrpPrice
					}
				}
			}
		}
	`,

	getSingleProduct: gql`
		query getSingleProduct($id: String!, $getPalette: Boolean!) {
			getSingleProduct(id: $id, getPalette: $getPalette) {
				product {
					ProductID
					description
					productName
					manufacturer
					category1
					category2
					category3
					topSeller
					minPrice
					maxPrice
					stock
					status
					image

					variants {
						VariantID
						MediaID
						price
						msrpPrice
						inventoryQty
						variantOption1
						variantOption2
						variantOption3
						shipping {
							shippingMethod
						}
					}
					medias {
						MediaID
						alt
						src
						miniPic
						mediaType
						width
						height
					}
					options {
						optionName
						optionPosition
						values
					}
				}
				rgbArr
			}
		}
	`,

	getProductByCateogry: gql`
		query getProductByCateogry($seed: String, $productId: String, $rgbArr: [[Int!]!]) {
			getProductByCateogry(seed: $seed, productId: $productId, rgbArr: $rgbArr) {
				products {
					ProductID
					productName
					category2
					minPrice
					maxPrice
					image
					variants {
						price
						msrpPrice
					}
				}
				tally
			}
		}
	`,

	getProductByColor: gql`
		query getProductByColor($color: PaletteInput!, $itemNumPerColor: Int!) {
			getProductByColor(color: $color, itemNumPerColor: $itemNumPerColor) {
				rgb
				products {
					ProductID
					productName
					image
					colors {
						hexCode
						colorIndex
					}
				}
			}
		}
	`,

	getPdByCatalog: gql`
		query getPdByCatalog($keySearch: filterType!, $filters: [filterType!]) {
			getPdByCatalog(keySearch: $keySearch, filters: $filters) {
				tally
				filterState
				products {
					ProductID
					productName
					status
					topSeller
					minPrice
					maxPrice
					image
					variants {
						price
						msrpPrice
					}
				}
			}
		}
	`,

	getCategoryByBrand: gql`
		query getCategoryByBrand($brand: String!) {
			getCategoryByBrand(brand: $brand) {
				categoryOfBrandSchema {
					category2
					category3
					count
				}

				pdOfCategoryList {
					name
					tally
					products {
						ProductID
						productName
						status
						topSeller
						minPrice
						maxPrice
						image
						variants {
							price
							msrpPrice
						}
					}
				}
			}
		}
	`,

	getProductByRoom: gql`
		query getProductByRoom(
			$color: PaletteInput!
			$roomSetList: [RoomSetInput]!
			$renew: Boolean!
		) {
			getProductByRoom(color: $color, roomSetList: $roomSetList, renew: $renew) {
				rgb
				roomSetList {
					category2
					total
					offset
				}
				products {
					ProductID
					productName
					status
					topSeller
					minPrice
					maxPrice
					image
					options {
						optionName
						optionPosition
					}
					variants {
						VariantID
						variantOption1
						variantOption2
						variantOption3
						price
						msrpPrice
						variantImage {
							mediaType
							src
							miniPic
							alt
							width
							height
						}
					}
					colors {
						hexCode
						colorIndex
					}
				}
			}
		}
	`,

	getProductByPalette: gql`
		query getProductByPalette(
			$color: PaletteInput
			$filters: FilterInput
			$page: Int
			$limit: Int
		) {
			getProductByPalette(color: $color, filters: $filters, page: $page, limit: $limit) {
				activePage
				totalCount
				rgb
				products {
					ProductID
					productName
					status
					topSeller
					minPrice
					maxPrice
					image
					options {
						optionName
						optionPosition
					}
					variants {
						VariantID
						variantOption1
						variantOption2
						variantOption3
						price
						msrpPrice
						variantImage {
							mediaType
							src
							miniPic
							alt
							width
							height
						}
					}
					colors {
						hexCode
						colorIndex
					}
				}
			}
		}
	`,

	getAIColor: gql`
		query getAIColor($lockedArr: [[Int]!], $setFuzzy: Boolean) {
			getAIColor(lockedArr: $lockedArr, setFuzzy: $setFuzzy) {
				rgb
			}
		}
	`,
	/** ******************************************
	 * Collection
	 */

	getCollectionByIds: gql`
		query getCollectionByIds($idList: [String!]) {
			getCollectionByIds(idList: $idList) {
				id
				title
				palette
				items {
					VariantID
					variantImage {
						miniPic
						src
						alt
					}
				}
			}
		}
	`,

	getCollectionsByTag: gql`
		query getCollectionsByTag($tagContent: String!) {
			getCollectionsByTag(tagContent: $tagContent) {
				id
				title
				palette
				items {
					VariantID
					variantImage {
						miniPic
						src
						alt
					}
				}
				tags {
					tag
					tagContent
				}
				savedUser {
					count
					hasClientSaved
				}
			}
		}
	`,

	getAllCollections: gql`
		query getAllCollections($tagList: [String!]!, $limit: Int) {
			getAllCollections(tagList: $tagList, limit: $limit) {
				name
				collections {
					id
					title
					palette
					updatedAt
					items {
						VariantID
						variantImage {
							miniPic
							src
							alt
						}
					}
					tags {
						tag
						tagContent
					}
					savedUser {
						count
						hasClientSaved
					}
				}
			}
		}
	`,

	getOneCollection: gql`
		query getOneCollection($collectionId: String!, $userId: String) {
			getOneCollection(collectionId: $collectionId, userId: $userId) {
				id
				title
				description
				palette
				createdAt
				author {
					displayName
					picture
				}
				images {
					src
					position
				}
				items {
					VariantID
					product {
						ProductID
						productName
						status
						topSeller
						minPrice
						maxPrice
						options {
							optionName
							optionPosition
						}
						variants {
							variantPosition
							variantOption1
							variantOption2
							variantOption3
							ProductID
							VariantID
							price
							msrpPrice
							inventoryQty
							variantImage {
								miniPic
								src
								alt
							}
						}
					}
				}
				tags {
					tag
					tagContent
				}
				savedUser {
					count
					hasClientSaved
				}
			}
		}
	`,

	getUserSavedCollectionList: gql`
		query getUserSavedCollectionList {
			getUserSavedCollectionList {
				id
				title
				description
				palette
				author {
					displayName
					picture
				}
				items {
					VariantID
					variantImage {
						MediaID
						src
						miniPic
						alt
						width
						height
					}
				}
				tags {
					tag
					tagContent
					option
				}
			}
		}
	`,

	saveCollection: gql`
		mutation saveCollection($collectionId: String!) {
			saveCollection(collectionId: $collectionId) {
				success
			}
		}
	`,

	deleteSavedCollection: gql`
		mutation deleteSavedCollection($collectionId: String!) {
			deleteSavedCollection(collectionId: $collectionId) {
				success
			}
		}
	`,

	/** ******************************************
	 *	Cart & checkout
	 */
	getGuestCartInfo: gql`
		query getGuestCartInfo {
			getGuestCartInfo {
				count
				cartId
			}
		}
	`,

	getUserCartInfo: gql`
		query getUserCartInfo {
			getUserCartInfo {
				count
				cartId
			}
		}
	`,

	addCartItem: gql`
		mutation addCartItem($quantity: Int, $cartId: String, $itemId: String!, $palette: String!) {
			addCartItem(cartId: $cartId, itemId: $itemId, quantity: $quantity, palette: $palette) {
				success
				cartId
			}
		}
	`,

	updateCartItem: gql`
		mutation updateCartItem($items: [CartItemUpdate]!, $cartId: String!) {
			updateCartItem(items: $items, cartId: $cartId) {
				success
			}
		}
	`,

	deleteCartItem: gql`
		mutation deleteCartItem($ids: [String!]!, $cartId: String!) {
			deleteCartItem(ids: $ids, cartId: $cartId) {
				success
			}
		}
	`,

	getUserCartItems: gql`
		query getUserCartItems {
			getUserCartItems {
				id
				inStock
				quantity
				palette
				shopifyLineId

				variant {
					VariantID
					ProductID
					MediaID
					price
					inventoryQty
					variantOption1
					variantOption2
					variantOption3
					variantImage {
						MediaID
						mediaType
						src
						miniPic
						position
						alt
						width
						height
					}
					product {
						productName
						options {
							optionName
							optionPosition
						}
					}
				}
			}
		}
	`,

	getCheckout: gql`
		query getCheckout($checkoutId: String!) {
			getCheckout(checkoutId: $checkoutId) {
				url
			}
		}
	`,

	getUserAllOrder: gql`
		query getUserAllOrder {
			getUserAllOrder {
				orderId
				placedAt
				orderName
				subTotalPrice
				totalTax
				contactInfo
				orderStatusUrl
				cancelledAt
				totalDiscount

				lineItems {
					variantId
					productId
					quantity
					price
					name
					palette
					image {
						width
						height
						miniPic
					}
				}

				paymentDetails {
					creditCardNumber
					creditCardCompany
				}

				billingAddress {
					address1
					address2
					city
					province
					country
					zip
					name
				}

				shippingAddress {
					address1
					address2
					city
					province
					country
					zip
					name
				}

				shippingLines {
					title
					price
				}

				fulfillments {
					id
					status
					shipmentStatus
					lastUpdate
					trackingCompany
					trackingNumber
					trackingUrl
					items {
						variantId
						productId
						quantity
						price
						name
						palette
						image {
							width
							height
							miniPic
						}
					}
				}
			}
		}
	`,

	cancelUserOrder: gql`
		mutation cancelUserOrder($orderId: String!) {
			cancelUserOrder(orderId: $orderId) {
				success
			}
		}
	`,

	/**
	 * get roomScene data
	 */

	getAllRoomScene: gql`
		query getAllRoomScene($offset: Int!) {
			getAllRoomScene(offset: $offset) {
				sceneList {
					id
					name
					productCount
				}
				newOffset
			}
		}
	`,

	getOneRoomScene: gql`
		query getOneRoomScene($id: String!) {
			getOneRoomScene(id: $id) {
				id
				name
				products {
					ProductID
					productName
					minPrice
					maxPrice
					image
					variants {
						msrpPrice
					}
				}
			}
		}
	`,

	// user preferences
	createUserMutation: gql`
		mutation createUser(
			$emailAddress: String!
			$password: String!
			$confirmPassword: String!
			$profile: UserProfileInput
			$preference: UserPreferenceInput
		) {
			databaseCreateUser(
				emailAddress: $emailAddress
				password: $password
				profile: $profile
				confirmPassword: $confirmPassword
				preference: $preference
			) {
				error {
					key
					message
				}
			}
		}
	`,

	mutateUserPreference: gql`
		mutation mutateUserPreference($preference: UserPreferenceInput) {
			mutateUserPreference(preference: $preference) {
				success
			}
		}
	`,

	fetchRoom: gql`
		query fetchRoom(
			$palette: [String!]
			$style: [String]
			$colorMood: [String]
			$roomType: String
			$color: [String]
		) {
			fetchRoom(
				palette: $palette
				style: $style
				color: $color
				colorMood: $colorMood
				roomType: $roomType
			) {
				categorySet {
					products {
						ProductID
						productName
						style
						category1
						category2
						category3
						minPrice
						maxPrice
						image
						colors {
							hexCode
						}
						variants {
							price
							msrpPrice
						}
					}
					key
					values
					limit
					name
				}
				palette
			}
		}
	`,
};
