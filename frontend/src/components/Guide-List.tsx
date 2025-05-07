import {
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress,
  Container,
  Paper,
  Link as MuiLink,
  TextField,
  Pagination,
  Stack,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import ReactMarkdown from 'react-markdown';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';

const reactionsMap: Record<ReactionType, { icon: React.ReactNode; label: string }> = {
  like: { icon: <ThumbUpAltIcon fontSize="small" />, label: 'Like' },
  dislike: { icon: <ThumbDownAltIcon fontSize="small" />, label: 'Dislike' },
};

interface Guide {
  postId: string;
  title: string;
  content: string;
  ownerId: string;
  username: string;
  createdAt: string;
  reactions?: { type: ReactionType; count: number }[];
}

type ReactionType = 'like' | 'dislike' ;

const ITEMS_PER_PAGE = 5;

export default function GuidesList() {
  const [posts, setPosts] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [userAvatars, setUserAvatars] = useState<Record<string, string>>({});
  const { token, logout } = useUser();

  useEffect(() => {
    const fetchPostsWithReactions = async () => {
      try {
        if (!token) {
          logout();
          return;
        }
  
        // Fetch all posts
        const res = await fetch('http://localhost:3000/api/v1/posts', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
  
        const postsData: Guide[] = await res.json();
        if (!res.ok) throw new Error('Failed to fetch posts');
  
        // Fetch reactions for each post and append them
        const postsWithReactions = await Promise.all(
          postsData.map(async (post) => {
            try {
              const reactionRes = await fetch(`http://localhost:3000/api/v1/posts/${post.postId}/reactions`, {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              });
  
              const reactionData: { type: ReactionType }[] = await reactionRes.json();
  
              if (!reactionRes.ok) throw new Error('Failed to fetch reactions');
  
              // Tally reactions
              const counts: Record<ReactionType, number> = { like: 0, dislike: 0 };
              reactionData.forEach(({ type }) => {
                if (type in counts) counts[type]++;
              });
  
              return {
                ...post,
                reactions: Object.entries(counts)
                  .filter(([, count]) => count > 0)
                  .map(([type, count]) => ({ type: type as ReactionType, count })),
              };
            } catch {
              return { ...post, reactions: [] };
            }
          })
        );
  
        setPosts(postsWithReactions);
        const uniqueOwnerIds = [...new Set(postsWithReactions.map(post => post.ownerId))];

        const avatars: Record<string, string> = {};
        await Promise.all(uniqueOwnerIds.map(async (userId) => {
          const res = await fetch(`http://localhost:3000/api/v1/users/${userId}/settings`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (!res.ok) throw new Error();

          const settingsData = await res.json();
          if (settingsData.minecraftUUID !== null && settingsData.minecraftUUID !== undefined) {
            avatars[userId] = `https://crafatar.com/avatars/${settingsData.minecraftUUID}?size=256&default=MHF_Steve&overlay`;
          } else {
            avatars[userId] = `https://crafatar.com/avatars/41f24f7d-929b-4018-bceb-fa38c6772eff?size=256&default=MHF_Steve&overlay`;
          }
        }));

        setUserAvatars(avatars);

      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
  
    fetchPostsWithReactions();
  }, [token, logout]);
  

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page on new search
  };

  const handleCreatePost = async () => {
    if (!newTitle || !newContent) return;
    const userId = token ? JSON.parse(atob(token.split('.')[1])).userId : null;
    try {
      const res = await fetch(`http://localhost:3000/api/v1/users/${userId}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
        }),
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create post');
  
      setPosts((prev) => [data, ...prev]);
      setNewTitle('');
      setNewContent('');
      setOpen(false);
    } catch (err: any) {
      alert(err.message || 'Something went wrong while creating the post.');
    }
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const displayedPosts = filteredPosts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container sx={{ mt: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Search for Guides</Typography>
          <IconButton color="primary" onClick={() => setOpen(true)}>
            Create Guide<AddIcon />
          </IconButton>
        </Box>
        <Box mb={2}>
          <TextField
            label="Search Guides"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearch}
          />
          
        </Box>
        <Typography variant="body2" color="text.secondary" mb={2}>
            {filteredPosts.length} {filteredPosts.length === 1 ? 'result' : 'results'} found
          </Typography>

        <List>
          {displayedPosts.map((post) => (
            <ListItem key={post.postId} sx={{ mb: 2 }} divider>
            <Box display="flex" alignItems="center" width="100%">
              <img
                src={userAvatars[post.ownerId]}
                alt="Avatar"
                style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 16 }}
              />
              <Box display="flex" justifyContent="space-between" alignItems="center" flexGrow={1}>
                <ListItemText
                  primary={
                    <MuiLink component={RouterLink} to={`/guides/${post.postId}`} underline="hover">
                      {post.title}
                    </MuiLink>
                  }
                  secondary={
                    <>
                      By:{' '}
                      <Typography component="span" fontWeight="bold">
                        {post.username || 'Unknown'}
                      </Typography>
                    </>
                  }
                />
          
                {post.reactions && post.reactions.length > 0 && (
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 2 }}>
                    {post.reactions.map(({ type, count }) => (
                      <Tooltip key={type} title={reactionsMap[type].label}>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          {reactionsMap[type].icon}
                          <Typography variant="body2">{count}</Typography>
                        </Stack>
                      </Tooltip>
                    ))}
                  </Stack>
                )}
                </Box>
              </Box>
            </ListItem>          
          ))}
        </List>

        {filteredPosts.length > ITEMS_PER_PAGE && (
          <Stack alignItems="center" mt={3}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
            />
          </Stack>
        )}
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create New Guide</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Content (Markdown supported)"
            fullWidth
            multiline
            minRows={4}
            variant="outlined"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          <Typography variant="subtitle1" mt={2}>Preview:</Typography>
          <Paper variant="outlined" sx={{ p: 1, minHeight: 100 }}>
            <ReactMarkdown>{newContent || '*Nothing to preview yet...*'}</ReactMarkdown>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreatePost} variant="contained">Post</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
