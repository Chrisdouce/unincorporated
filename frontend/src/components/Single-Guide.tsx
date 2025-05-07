import { JSX, useEffect, useState } from 'react';
import {
  Typography,
  Container,
  Paper,
  CircularProgress
} from '@mui/material';
import { useUser } from '../context/UserContext';
import ReactMarkdown from 'react-markdown';
import { useParams } from 'react-router';

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

export default function Guide(): JSX.Element {
  const { title } = useParams<{ title: string }>();
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
        const res = await fetch(`http://localhost:3000/api/v1/posts`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const data: Post[] = await res.json();
        const slugify = (str: string) =>
          str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        const matched = data.find(
          (g) => slugify(g.title) === title?.toLowerCase()
        );
        
        if (matched) {
          setPost(matched);
        } else {
          setError('Post not found');
        }
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
  
    fetchPost();
  }, [title, token, logout]);
  

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
        <ReactMarkdown>
          {post.content}
        </ReactMarkdown>
      </Paper>
    </Container>
  );
}
