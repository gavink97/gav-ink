import { press } from 'motion';

function table(primary = 'date', order = 'asc') {
	const uri = '/component/open-source-table';
	const url = `${uri}?primary=${primary}&order=${order}`;

	fetch(url)
		.then((res) => {
			if (!res.ok) {
				throw new Error(`HTTP error! status: ${res.status}`);
			}
			return res.text();
		})
		.then((html) => {
			const projectsTable = document.getElementById('open-source-projects');
			projectsTable.outerHTML = html;

			const projectButton = document.getElementById('table-button-project');
			const dateButton = document.getElementById('table-button-date');
			const stargazersButton = document.getElementById('table-button-stargazers');
			actionListener(projectButton, dateButton, stargazersButton);
		})
		.catch((err) => {
			console.error('Error fetching modal:', err);
		});
}

function actionListener(projectButton: HTMLElement, dateButton: HTMLElement, stargazersButton: HTMLElement) {
	for (const button of [projectButton, dateButton, stargazersButton]) {
		press(button, () => {
			let primary = '';

			switch (button.id) {
				case 'table-button-project':
					primary = 'name';
					table(primary);
					break;

				case 'table-button-date':
					primary = 'date';
					table(primary);
					break;

				case 'table-button-stargazers':
					primary = 'stargazers';
					table(primary);
					break;

				default:
					table();
			}
		});
	}
}

document.addEventListener('DOMContentLoaded', () => {
	table();
});
