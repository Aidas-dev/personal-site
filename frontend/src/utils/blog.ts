import matter from 'gray-matter';

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  content: string;
}

// Use Vite's glob import to get all markdown files in the blog directory
// This works at build time, and the content is bundled
const posts = import.meta.glob('../content/blog/*.md', {
  query: '?raw',
  eager: true,
});

export async function getAllPosts(): Promise<BlogPost[]> {
  const allPosts = Object.entries(posts).map(([filepath, content]) => {
    const slug = filepath.split('/').pop()?.replace('.md', '') ?? '';
    const { data, content: body } = matter(content as string);

    return {
      slug,
      title: data.title || 'Untitled Post',
      date: data.date || '',
      description: data.description || '',
      tags: data.tags || [],
      content: body,
    } as BlogPost;
  });

  // Sort by date descending
  return allPosts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const allPosts = await getAllPosts();
  return allPosts.find((p) => p.slug === slug) || null;
}
