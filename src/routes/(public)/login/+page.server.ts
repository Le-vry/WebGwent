import type { Actions } from '@sveltejs/kit';
import { registerAction, loginAction } from '$lib/server/auth';

export const actions: Actions = {
    login: loginAction,
	register: registerAction
};
