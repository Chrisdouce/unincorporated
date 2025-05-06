import { useEffect, useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress,
  Container,
  Paper,
  Link as MuiLink
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

export default function GuidesList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { token, logout } = useUser();

  useEffect(() => {
    const fetchPosts = async () => {
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
        if (!res.ok) throw new Error('Failed to fetch posts');
        const data = await res.json();
        setPosts(data);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [token, logout]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Guide List
        </Typography>
        <List>
          {posts.map((post) => (
            <ListItem key={post.id} alignItems="flex-start" disablePadding sx={{ mb: 2 }}>
              <ListItemText
                primary={
                  <MuiLink>
                    {post.title}
                  </MuiLink>
                }
                secondary={`By: ${post.author?.username ?? 'Unknown'}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
}
