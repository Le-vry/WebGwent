import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export const load = async ({ locals }: RequestEvent) => {
	if (locals.user) {
		throw redirect(303, '/card-select');
	}

	return {};
};
