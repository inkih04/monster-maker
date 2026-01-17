/* eslint-disable no-control-regex */
export default function checkInvalidChars(name: string) {
	const invalidChars = /[<>:"/\\|?*\u0000-\u001F]/;
	if (invalidChars.test(name) || name === '.' || name === '..') {
		return false;
	}

	return true;
}
