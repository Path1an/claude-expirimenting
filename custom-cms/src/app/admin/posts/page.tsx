import { db } from '@/db';
import { posts } from '@/db/schema';
import { asc } from 'drizzle-orm';
import Link from 'next/link';
import PostList from './PostList';

export default async function PostsListPage() {
  const allPosts = await db.select().from(posts).orderBy(asc(posts.sortOrder), asc(posts.id));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">Blog Posts</h1>
          <p className="text-gray-400 dark:text-zinc-500 text-sm mt-1">{allPosts.length} post{allPosts.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/admin/posts/new" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + New Post
        </Link>
      </div>
      <PostList initialPosts={allPosts} />
    </div>
  );
}
