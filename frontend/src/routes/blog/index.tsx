// @ts-nocheck
import { createFileRoute, Link } from '@tanstack/react-router';
import { Hexagon } from '@/components/ui/Hexagon';
import { getAllPosts } from '@/utils/blog';

export const Route = createFileRoute('/blog/')({
  loader: async () => {
    return {
      posts: await getAllPosts(),
    };
  },
  head: () => ({
    meta: [
      { title: 'Blog | Aidas Kriščiūnas' },
      {
        name: 'description',
        content: 'Thoughts on infrastructure, Kubernetes, and software development.',
      },
    ],
  }),
  component: BlogList,
});

function BlogList() {
  const { posts } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-16 px-4 relative overflow-hidden">
      <div className="absolute top-20 right-10 opacity-10" aria-hidden="true">
        <Hexagon size="lg" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <h1 className="text-4xl font-bold text-primary-900 dark:text-primary-100 mb-4">
          Blog
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-12 text-lg">
          Deep dives into infrastructure, Kubernetes, and modern web engineering.
        </p>

        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group bg-white dark:bg-neutral-900 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <time className="text-sm font-medium text-primary-600 dark:text-primary-400">
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <div className="flex gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs font-medium rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="block group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
              >
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                  {post.title}
                </h2>
              </Link>

              <p className="text-neutral-600 dark:text-neutral-400 mb-6 line-clamp-2">
                {post.description}
              </p>

              <Link
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="inline-flex items-center text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline"
              >
                Read more
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </article>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800">
            <p className="text-neutral-500 dark:text-neutral-400">
              No posts found yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
