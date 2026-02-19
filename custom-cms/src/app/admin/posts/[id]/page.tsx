import PostForm from '../PostForm';

interface Props { params: Promise<{ id: string }> }

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  return <PostForm id={id} />;
}
