/**
 *	Huedeck, Inc
 */

import React from 'react';
import Layout from '../../components/Layout';
import StyleQuiz from './StyleQuiz';
import quizContent from './quizContent.json';

const title = 'Style Quiz';

function action({ store }) {
	const { loggedIn } = store.getState();
	// if (loggedIn && Object.keys(loggedIn.preference).length) return {
	// 	redirect: '/room'
	// }

	return {
		chunks: ['styleQuiz'],
		title,

		component: (
			<Layout hideSubHeader hideFooter>
				<StyleQuiz {...quizContent} />
			</Layout>
		),
	};
}

export default action;
