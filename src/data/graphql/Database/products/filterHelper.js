import { Op } from 'sequelize';
// import sequelize from '../../../sequelize';

function getFilterQuery(filterArgs) {
	const filter = {
		productQuery: {
			display: true,
			stock: 1, // in stock is required
		},
		variantQuery: {},
		orderQuery: [], // default order
	};

	if (!Object.keys(filterArgs).length) return filter;

	// fitler sorting query
	if (Object.prototype.hasOwnProperty.call(filterArgs, 'sort')) {
		const { sort } = filterArgs;
		if (sort === 'topseller') {
			filter.productQuery.topSeller = {
				[Op.gte]: 0.85,
			};
			filter.orderQuery = [['topseller', 'DESC']];
		} else if (sort === 'price-ltoh') {
			filter.orderQuery = [['minPrice', 'ASC']];
		} else if (sort === 'price-htol') {
			filter.orderQuery = [['maxPrice', 'DESC']];
		}
	}

	// other fitlers
	if (Object.prototype.hasOwnProperty.call(filterArgs, 'categories')) {
		for (let i = 0, len = filterArgs.categories.length; i < len; i += 1) {
			filter.productQuery[`category${Number(i + 1)}`] = filterArgs.categories[i];
		}
	}

	if (Object.prototype.hasOwnProperty.call(filterArgs, 'category')) {
		const { cat1List, cat2List } = filterArgs.category;
		if (cat1List)
			filter.productQuery.category1 = {
				[Op.notIn]: cat1List,
			};

		if (cat2List)
			filter.productQuery.category2 = {
				[Op.notIn]: cat2List,
			};
	}

	if (Object.prototype.hasOwnProperty.call(filterArgs, 'styles')) {
		if (filterArgs.styles.length) {
			filter.productQuery.style = {
				[Op.in]: filterArgs.styles,
			};
		}
	}

	if (Object.prototype.hasOwnProperty.call(filterArgs, 'brand')) {
		// we now support filter by 1 brand only
		const brand = filterArgs.brand
			.split(' ')[0]
			.split('-')
			.join(' ');
		filter.productQuery.manufacturer = {
			[Op.like]: `%${brand}%`,
		};
	}

	if (
		Object.prototype.hasOwnProperty.call(filterArgs, 'priceRange') &&
		filterArgs.priceRange.length === 2
	) {
		const range = filterArgs.priceRange;
		if (range[1]) {
			// do not allow max < min
			if (range[1] > range[0]) {
				filter.variantQuery.price = { [Op.between]: range };
			}
		} else {
			filter.variantQuery.price = { [Op.gte]: range[0] || 0 };
		}
	}

	if (
		Object.prototype.hasOwnProperty.call(filterArgs, 'lengthRange') &&
		filterArgs.lengthRange.length === 2
	) {
		const range = filterArgs.lengthRange;
		if (range[1]) {
			filter.variantQuery.lengthInch = { [Op.between]: range };
		} else {
			filter.variantQuery.lengthInch = { [Op.gte]: range[0] || 0 };
		}
	}

	if (
		Object.prototype.hasOwnProperty.call(filterArgs, 'widthRange') &&
		filterArgs.widthRange.length === 2
	) {
		const range = filterArgs.widthRange;
		if (range[1]) {
			filter.variantQuery.widthInch = { [Op.between]: range };
		} else {
			filter.variantQuery.widthInch = { [Op.gte]: range[0] || 0 };
		}
	}

	if (
		Object.prototype.hasOwnProperty.call(filterArgs, 'heightRange') &&
		filterArgs.heightRange.length === 2
	) {
		const range = filterArgs.heightRange;
		if (range[1]) {
			filter.variantQuery.heightInch = { [Op.between]: range };
		} else {
			filter.variantQuery.heightInch = { [Op.gte]: range[0] || 0 };
		}
	}

	return filter;
}

export default {
	getFilterQuery,
};
