

const posts = import.meta.glob('../*.svx');

export async function load({ params }) {
  const path = `../${params.slug}.svx`;
  
  const loader = posts[path];
  if (!loader) {
    throw new Error(`Post not found: ${params.slug}`);
  }

  const post = await loader();

  const { title, date } = post.metadata;
  const content = post.default;

  return {
    content,
    title,
    date,
  };
}