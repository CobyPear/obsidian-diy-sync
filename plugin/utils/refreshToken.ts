export const refreshToken = async (url: string, username: string) => {
	const res = await fetch(`${url}/api/refresh_token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
		body: JSON.stringify({
			username,
		}),
	});
	if (res.ok) {
		const data = await res.json();
		console.log('data', data);
		return true;
	} else if (res.status === 401) {
		return false;
	}
};
