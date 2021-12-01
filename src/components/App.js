/**
 *	Huedeck, Inc.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Provider as ReduxProvider } from 'react-redux';
import { ApolloProvider } from 'react-apollo';

const ContextType = {
	// Enables critical path CSS rendering
	// https://github.com/kriasoft/isomorphic-style-loader
	insertCss: PropTypes.func.isRequired,
	// Universal HTTP client
	fetch: PropTypes.func.isRequired,
	pathname: PropTypes.string.isRequired,
	query: PropTypes.object,
	// Integrate Redux
	// http://redux.js.org/docs/basics/UsageWithReact.html
	...ReduxProvider.childContextTypes,
	// Apollo Client
	client: PropTypes.object.isRequired,

	// Facebook event tracking tool
	reactFbPixel: PropTypes.object,
};

class App extends React.PureComponent {
	static propTypes = {
		context: PropTypes.shape(ContextType).isRequired,
		children: PropTypes.element.isRequired,
	};

	static childContextTypes = ContextType;

	getChildContext() {
		return this.props.context;
	}

	render() {
		// Here, we are at universe level, sure? ;-)
		const { client } = this.props.context;
		// NOTE: If you need to add or modify header, footer etc. of the app,
		// please do that inside the Layout component.
		return <ApolloProvider client={client}>{this.props.children}</ApolloProvider>;
	}
}

export default App;
