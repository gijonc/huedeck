/**
 *	Huedeck, Inc
 */

// determine how many collection should be fetched
const MAX_ITEM_NUM_PER_ROW = 4;
function getNumberOfCollectionInRow(width) {
	// 1920px or above
	if (width === 'xl') {
		return MAX_ITEM_NUM_PER_ROW;
		// 960px or above
	} else if (width === 'lg' || width === 'md') {
		return 3;
	}
	// between 0 ~ 960px
	return 2;
}

// define collection Grid properties
const gridContainerProps = {
	justify: 'flex-start',
};

const gridCardProps = {
	xl: 3,
	md: 4,
	sm: 6,
	xs: 12,
};

export { getNumberOfCollectionInRow, gridContainerProps, gridCardProps };
