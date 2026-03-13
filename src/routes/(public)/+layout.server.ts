export const load = async ({ locals }: { locals: { user?: unknown } }) => {
	return {
		user: locals.user ?? null
	};
};