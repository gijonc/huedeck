import Collection from './Collection';
import CollectionTag from './CollectionTag';
import CollectionImage from './CollectionImage';

Collection.hasMany(CollectionImage, {
	foreignKey: 'CollectionID',
	as: 'images',
	onUpdate: 'cascade',
	onDelete: 'cascade',
});

Collection.hasMany(CollectionTag, {
	foreignKey: 'CollectionID',
	as: 'tags',
	onUpdate: 'cascade',
	onDelete: 'cascade',
});

export { Collection, CollectionTag, CollectionImage };
