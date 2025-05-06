import { JSX, useEffect, useState } from 'react';
import {
  Typography,
  Container,
  Paper,
  CircularProgress
} from '@mui/material';
import { useUser } from '../context/UserContext';

interface Author {
  id: string;
  username: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: Author;
}

export default function SinglePost({ openedPostId }: { openedPostId: string }): JSX.Element {
  const { token, logout } = useUser();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (!token) {
          logout();
          return;
        }
        const res = await fetch(`http://localhost:3000/api/v1/posts/${openedPostId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch post');
        const data = await res.json();
        setPost(data);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    if (openedPostId) {
      fetchPost();
    }
  }, [openedPostId, token, logout]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!post) return <Typography>No post found</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {post.title}
        </Typography>
        <Typography variant="subtitle1" gutterBottom color="text.secondary">
          By: {post.author?.username ?? 'Unknown'}
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          {post.content}
        </Typography>
      </Paper>
    </Container>
  );
}
