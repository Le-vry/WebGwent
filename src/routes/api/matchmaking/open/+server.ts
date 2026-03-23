import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getOpenMatchesForUser } from '$lib/server/openMatchUpdates';

export const GET = async ({ locals }: RequestEvent) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const userId = locals.user.id;
		const matches = await getOpenMatchesForUser(userId);

		return json({ matches });
	} catch (error) {
		console.error('Failed to load open matches:', error);
		return json({ error: 'Could not load open matches.' }, { status: 500 });
	}
};
