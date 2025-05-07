import React, { JSX, useEffect, useState } from 'react';
import {
  Typography,
  Container,
  Paper,
  CircularProgress,
  Tooltip,
  Popover,
  Stack,
  Box,
  IconButton,
  Divider,
} from '@mui/material';
import { useUser } from '../context/UserContext';
import ReactMarkdown from 'react-markdown';
import { useNavigate, useParams } from 'react-router';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TagFacesIcon from '@mui/icons-material/TagFaces';
import { Link } from 'react-router-dom';

const reactionsMap = {
  like: { icon: <ThumbUpAltIcon />, label: 'Like' },
  dislike: { icon: <ThumbDownAltIcon />, label: 'Dislike' },
};

type ReactionType = keyof typeof reactionsMap;

interface Author {
  id: string;
  username: string;
  minecraftUUID?: string;
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
  const navigate = useNavigate();

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

      setUserReaction(null);

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
      const userRes = await fetch(`http://localhost:3000/api/v1/users/${data.ownerId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const dataUser = await userRes.json();
      if (!dataUser) {
        setError('Post not found');
        return;
      }
      if (userRes.status === 401) {
        logout();
        return;
      }

      const ign = await fetch(`http://localhost:3000/api/v1/users/${data.ownerId}/settings`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const ignData = await ign.json();
      if (ign.status === 401) {
        logout();
        return;
      }
      if (ignData.minecraftUUID) {
        data.minecraftUUID = ignData.minecraftUUID;
      }
      data.username = dataUser.username;
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
          minecraftUUID: data.minecraftUUID,
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
      <IconButton onClick={() => navigate('/guides')} color="primary">
        <ArrowBackIcon />
      </IconButton>
      <Paper elevation={6} sx={{ p: 3, boxShadow: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <img
              src={post.author.minecraftUUID ? `https://crafatar.com/avatars/${post.author.minecraftUUID}?size=64&default=MHF_Steve&overlay` : 'https://crafatar.com/avatars/579ad0c0-c7ef-4004-8c09-e1da6ec7402c?size=64&default=MHF_Steve&overlay'}
              alt="User Avatar"
              style={{
                marginRight: 16,
                border: '2px solid #ddd',
                padding: 2,
              }}
            />
            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                {post.title}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                By{' '}
                <Link to={`/users/${post.author.id}`} style={{ textDecoration: 'none', color: 'primary.main' }}>
                  {post.author.username ?? 'Unknown'}
                </Link>
              </Typography>
            </Box>
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
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
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

        <Divider sx={{ my: 2 }} />

        <Box mt={3}>
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </Box>
      </Paper>
    </Container>
  );
}
