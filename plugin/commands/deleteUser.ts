import { App } from 'obsidian';
import { MessageModal } from 'components/modals';
import { NodeSyncPluginSettings } from 'types';

export const deleteUser = async (
	settings: NodeSyncPluginSettings,
	app: App,
) => {
	const username = localStorage.getItem('user');

	if (username) {
		const res = await fetch(`${settings.apiHost}/api/user`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify({ username }),
		});
		if (res.ok) {
			const data = await res.json();
			localStorage.removeItem('user');
			new MessageModal(app, data.message).open();
		}
	} else {
		new MessageModal(app, 'No user to delete').open();
	}
};
