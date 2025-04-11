import token from '../../tokens.json';

function updatePadding(): void {
	const links = document.querySelector('footer-links') as HTMLElement;
	const contacts = document.querySelector('footer-socials-contact') as HTMLElement;

	const vh = window.innerHeight * 0.01;
	const vw = window.innerWidth;
	const lg = Number.parseInt(String(token.viewport.lg.value).slice(0, -2));

	const minthreshold = 7.55;

	if (vw < lg) {
		if (vh < minthreshold) {
			for (const element of [links, contacts]) {
				//element.style.top = `${Math.min(maxTop, padding)}px`;
				element.style.gridRow = '5 / span 6';
			}
		} else {
			for (const element of [links, contacts]) {
				element.style.gridRow = '4 / span 6';
			}
		}
	} else {
		for (const element of [links, contacts]) {
			element.style.gridRow = '3 / span 5';
		}
	}
}
updatePadding();

// resize seems to be creating a bug and does not acount for innerHeight changing
window.addEventListener('resize', updatePadding);
document.addEventListener('DOMContentLoaded', updatePadding);
