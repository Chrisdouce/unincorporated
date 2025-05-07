import React, { JSX, useEffect, useState } from 'react';
import {
  Typography,
  Container,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
  Popover,
  Stack,
  Box
} from '@mui/material';
import { useUser } from '../context/UserContext';
import ReactMarkdown from 'react-markdown';
import { useParams } from 'react-router';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import TagFacesIcon from '@mui/icons-material/TagFaces';

const reactionsMap = {
  like: { icon: <ThumbUpAltIcon />, label: 'Like' },
  dislike: { icon: <ThumbDownAltIcon />, label: 'Dislike' },
};

type ReactionType = keyof typeof reactionsMap;

interface Author {
  id: string;
  username: string;
}

interface Reaction {
  type: ReactionType;
  count: number;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: Author;
  likes: number;
  dislikes: number;
  reactions: Reaction[];
}

export default function Guide(): JSX.Element {
  const { postId } = useParams<{ postId: string }>();
  const { token, logout } = useUser();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleReactionClick = async (type: ReactionType) => {
    handleCloseMenu();
    await reactToPost(type);
  };

  const open = Boolean(anchorEl);

  const fetchPost = async () => {
    try {
      if (!token) {
        logout();
        return;
      }

      setUserReaction(null); // Reset early

      const res = await fetch(`http://localhost:3000/api/v1/posts/${postId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        setError('Unable to find post');
        return;
      }
      const data = await res.json();
      if (!data) {
        setError('Post not found');
        return;
      }

      const userId = JSON.parse(atob(token.split('.')[1])).userId;
      const reactionsRes = await fetch(
        `http://localhost:3000/api/v1/users/${userId}/posts/${postId}/reactions`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const reactionData = await reactionsRes.json();
      const postReaction = reactionData.find((r: { postId: string }) => r.postId === postId);

      if (postReaction) {
        setUserReaction(postReaction.type);
      }

      setPost({
        id: data.postId,
        title: data.title,
        content: data.content,
        author: {
          id: data.ownerId,
          username: data.username,
        },
        likes: data.likes,
        dislikes: data.dislikes,
        reactions: data.reactions || [],
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId, token]);

  const reactToPost = async (type: ReactionType) => {
    if (!post || !token) return;

    const userId = JSON.parse(atob(token.split('.')[1])).userId;

    try {
      let res;
      const isSameReaction = userReaction === type;

      if (isSameReaction) {
        res = await fetch(
          `http://localhost:3000/api/v1/users/${userId}/posts/${post.id}/reactions`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error('Failed to remove reaction');

        setUserReaction(null);
      } else {
        const method = userReaction ? 'PUT' : 'POST';

        res = await fetch(
          `http://localhost:3000/api/v1/users/${userId}/posts/${post.id}/reactions`,
          {
            method,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ type }),
          }
        );

        if (!res.ok) throw new Error('Failed to react to post');

        setUserReaction(type);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!post) return <Typography>No post found</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h4" gutterBottom>
              {post.title}
            </Typography>
            <Typography variant="subtitle1" gutterBottom color="text.secondary">
              By: {post.author?.username ?? 'Unknown'}
            </Typography>
          </Box>

          <Box>
            <Tooltip title={userReaction ? reactionsMap[userReaction].label : 'React'}>
              <IconButton onClick={handleOpenMenu} color="primary">
                {userReaction ? reactionsMap[userReaction].icon : <TagFacesIcon />}
              </IconButton>
            </Tooltip>
            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handleCloseMenu}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
            >
              <Stack direction="row" spacing={1} p={1}>
                {Object.entries(reactionsMap).map(([type, { icon, label }]) => (
                  <Tooltip title={label} key={type}>
                    <IconButton onClick={() => handleReactionClick(type as ReactionType)}>
                      {icon}
                    </IconButton>
                  </Tooltip>
                ))}
              </Stack>
            </Popover>
          </Box>
        </Box>

        <Box mt={3}>
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </Box>
      </Paper>
    </Container>
  );
}
