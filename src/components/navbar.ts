import { hover } from 'motion';
import token from '../../tokens.json';

dropdown();

function dropdown(): void {
	const services = document.getElementById('services-menu');
	const dropdown = document.getElementById('dropdownmenu');

	dropdown.style.display = 'none';
	services.style.backgroundColor = token.color.ui.inactive.value;

	hover([services, dropdown], () => {
		dropdown.style.display = 'block';
		services.style.backgroundColor = token.color.ui.active.value;

		return () => {
			dropdown.style.display = 'none';
			services.style.backgroundColor = token.color.ui.inactive.value;
		};
	});
}
