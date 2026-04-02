import type { Post, Book } from "../data";

interface PostCardProps {
  post: Post;
  idx: number;
  onUser: (uid: string) => void;
  onBook: (book: Book) => void;
  onShare: (post: Post) => void;
  onDetail: (postId: string) => void;
  toast: (msg: string) => void;
  requireAuth?: () => void;
}

export function PostCard({ post, idx, onDetail }: PostCardProps) {
  return (
    <div className="feed-item" style={{ animationDelay: `${idx * 0.04}s` }} onClick={() => onDetail(post.id)}>
      <span className="feed-quote">{post.quote}</span>
      <span className="feed-src">{post.book.title} · {post.book.author}</span>
    </div>
  );
}
