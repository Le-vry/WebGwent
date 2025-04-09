
export async function load() {
	const modules = import.meta.glob('./*.svx');
	const posts = await Promise.all(
		Object.entries(modules).map(async ([path, resolver]) => {
			const { metadata } = await resolver();
			const slug = path.split('/').pop().replace('.svx', '');
			return { slug, ...metadata };
		})
	);
	posts.sort((a, b) => new Date(b.date) - new Date(a.date));
	return { posts };
}
