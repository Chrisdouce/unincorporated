"use client";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import ReactMarkdown from "react-markdown";

type ReactionType = 'like' | 'dislike' ;

export default function Guide() {

  const [posts, setPosts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { token, logout } = useUser();

  const [isEditing, setIsEditing] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  const displayedPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch("http://localhost:3000/api/v1/posts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      // Fetch reactions for each post and append them
      const postsWithReactions = await Promise.all(
        data.map(async (post) => {
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
            console.log(counts)
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
    };

    if (token) fetchPosts();
  }, [token]);

  async function handleSavePost() {
    if (!newTitle || !newContent) 
      return alert("Title and content are required.");

    const userId = token ? JSON.parse(atob(token.split('.')[1])).userId : null;

    try {
      const route = isEditing
        ? `/api/v1/users/${userId}/posts/${editingPostId}`
        : `/api/v1/users/${userId}/posts`;

      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(`http://localhost:3000${route}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
        }),
      });

      const data = await res.json();
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) throw new Error(data.message || 'Failed to save post');

      if (isEditing) {
        setPosts((prev) =>
          prev.map((post) =>
            post.postId === editingPostId ? { ...post, ...data } : post
          )
        );
      } else {
        setPosts((prev) => [data, ...prev]);
      }

      setNewTitle("");
      setNewContent("");
      setOpen(false);
      setIsEditing(false);
      setEditingPostId(null);
    } catch (err: any) {
      alert(err.message || "Something went wrong while saving the post.");
    }
  };

  async function handleDeletePost(postId: string) {
    const confirmed = window.confirm("Are you sure you want to delete this post?");
    if (!confirmed) return;

    try {
      const userId = token ? JSON.parse(atob(token.split('.')[1])).userId : null;
      const res = await fetch(`http://localhost:3000/api/v1/users/${userId}/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete post");

      setPosts((prev) => prev.filter((post) => post.postId !== postId));
    } catch (err: any) {
      alert(err.message || "Error deleting post");
    }
  }

  return (<>
    <Paper sx={{ margin: 2, padding: 5 }}>
      <Typography variant="h5" align="center">
        {"Guides"}
      </Typography>
    </Paper>
    <Box sx={{ padding: 2, px: 5, pt: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 2 }}>
        <Button
          variant="outlined"
          onClick={() => {
            setOpen(true);
            setIsEditing(false);
            setEditingPostId(null);
            setNewTitle("");
            setNewContent("");
          }}
        >
          Create
        </Button>

        <Box sx={{ flexGrow: 1 }}>
          <TextField fullWidth label="Search for Guides" variant="outlined" />
        </Box>
        <Button variant="outlined">Filter</Button>
      </Box>
    </Box>
    <Box margin="auto" padding={2}>
      
      <Divider sx={{ marginY: 2 }} />
      <List>
        {displayedPosts.map((post) => (
          <ListItem
            key={post.postId}
            sx={{
              flexDirection: "column",
              alignItems: "flex-start",
              border: "1px solid #ccc",
              borderRadius: 2,
              padding: 2,
              marginBottom: 2,
            }}
          >
            <Typography
              variant="h6"
              component="a"
              href={`/guides/${post.postId}`}
              sx={{
                textDecoration: "none",
                color: "primary.main",
                '&:hover': { textDecoration: "underline" },
              }}
            >
              {post.title}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                whiteSpace: "pre-wrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 5, // show only 5 lines
                WebkitBoxOrient: "vertical",
              }}
            >
              {post.content}
            </Typography>

            <Typography variant="caption" color="textSecondary">
              Created at: {new Date(post.createdAt).toLocaleString()}
            </Typography>

            <Typography
              variant="caption"
              color="primary"
              component="a"
              href={`/users/${post.ownerId}`}
              sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" }, mt: 0.5 }}
            >
              @{post.username || "Unknown"}
            </Typography>

            {post.reactions && post.reactions.length > 0 && (
              <Stack direction="row" spacing={1} mt={1}>
                {post.reactions.map((reaction) => (
                  <Typography key={reaction.type} variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {reaction.type === "like" ? "👍" : "👎"} {reaction.count}
                  </Typography>
                ))}
              </Stack>
            )}
          </ListItem>
        ))}
      </List>


      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            height: '90vh',
            width: '100%',
            maxWidth: '100%',
          },
        }}
      >
        <DialogTitle>{isEditing ? "Edit Guide" : "Create New Guide"}</DialogTitle>
        <DialogContent
          dividers
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            overflow: 'hidden',
            height: '100%',
          }}
        >
          <TextField
            margin="dense"
            label="Title"
            fullWidth
            required
            variant="outlined"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />

          <Box sx={{ flex: 1, display: 'flex', gap: 1, overflow: 'hidden' }}>
            <TextField
              label="Content (Markdown supported)"
              fullWidth
              multiline
              required
              variant="outlined"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              sx={{
                flex: 1,
                overflow: 'auto',
                height: '100%',
                '& .MuiInputBase-root': {
                  height: '100%',
                  alignItems: 'flex-start',
                },
                '& textarea': {
                  height: '100% !important',
                },
              }}
            />

            <Box
              sx={(theme) => ({
                flex: 1,
                overflowY: 'auto',
                border: '1px solid',
                borderColor: theme.palette.divider,
                borderRadius: 1,
                padding: 1,
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.primary,
              })}
            >
              <Typography variant="subtitle1">Preview:</Typography>
              <ReactMarkdown>{newContent || '*Nothing to preview yet...*'}</ReactMarkdown>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpen(false); 
            setIsEditing(false);
            setNewTitle("");
            setNewContent("");
            setEditingPostId(null);}}>Cancel</Button>
          <Button onClick={handleSavePost} variant="contained">
            {isEditing ? "Update" : "Post"}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
    </>
  );
}
