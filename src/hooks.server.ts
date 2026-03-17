import type { Handle } from '@sveltejs/kit';
import { validateSession } from '$lib/server/session';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get('sessionToken');
	const session = await validateSession(sessionToken);

	if (session?.user) {
		event.locals.user = {
			id: session.user.id,
			username: session.user.username
		};
	} else {
		event.locals.user = null;
		if (sessionToken) {
			event.cookies.delete('sessionToken', { path: '/' });
		}
	}

	return resolve(event);
};
