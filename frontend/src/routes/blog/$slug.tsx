import { createFileRoute, Link } from '@tanstack/react-router';
import ReactMarkdown from 'react-markdown';
import { Hexagon } from '@/components/ui/Hexagon';
import { getPostBySlug } from '@/utils/blog';

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params }) => {
    const post = await getPostBySlug(params.slug);
    if (!post) {
      throw new Error('Post not found');
    }
    return { post };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.post?.title} | Aidas Kriščiūnas` },
      { name: 'description', content: loaderData?.post?.description },
      { property: 'og:title', content: loaderData?.post?.title },
      { property: 'og:description', content: loaderData?.post?.description },
      { property: 'og:type', content: 'article' },
    ],
  }),
  component: PostDetail,
});

function PostDetail() {
  const { post } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-16 px-4 relative overflow-hidden">
      <div className="absolute top-40 left-10 opacity-5" aria-hidden="true">
        <Hexagon size="xl" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <Link
          to="/blog"
          className="inline-flex items-center text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 mb-8 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to all posts
        </Link>

        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4">
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
                  className="px-3 py-1 text-xs font-medium rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
            {post.title}
          </h1>
        </header>

        <article className="prose prose-neutral dark:prose-invert max-w-none bg-white dark:bg-neutral-900/50 rounded-3xl p-8 sm:p-12 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <ReactMarkdown
            components={{
              h1: ({ ...props }) => <h1 className="text-3xl font-bold mb-6" {...props} />,
              h2: ({ ...props }) => <h2 className="text-2xl font-bold mt-10 mb-4" {...props} />,
              p: ({ ...props }) => <p className="mb-6 leading-relaxed text-neutral-700 dark:text-neutral-300" {...props} />,
              ul: ({ ...props }) => <ul className="list-disc list-inside mb-6 space-y-2" {...props} />,
              li: ({ ...props }) => <li className="text-neutral-700 dark:text-neutral-300" {...props} />,
              code: ({ ...props }) => (
                <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-sm" {...props} />
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
