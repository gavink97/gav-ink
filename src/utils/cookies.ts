export function GetCookie(name: string): string {
	const key = new String().concat(name, '=');
	const ca = document.cookie.split(';');

	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) === ' ') {
			c = c.substring(1, c.length);
		}
		if (c.indexOf(key) === 0) {
			return decodeURIComponent(c.substring(key.length, c.length));
		}
	}
	return '';
}

export function CheckGLCookie(): boolean {
	const prefnogl = GetCookie('prefnogl');
	if (prefnogl !== '') {
		if (prefnogl === 'true') {
			return false;
		}
	}

	const nogl = GetCookie('nogl');
	if (nogl === '') {
		return true;
	}

	if (nogl === 'true') {
		return false;
	}

	return true;
}
