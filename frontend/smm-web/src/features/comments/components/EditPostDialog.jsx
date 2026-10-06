import { useState } from 'react';
import {
  Alert, Box, Button, CircularProgress, Dialog,
  DialogActions, DialogContent, DialogTitle, TextField,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePost } from '../api/postsApi';
import { API_ORIGIN } from '../../../config';

export default function EditPostDialog({ open, onClose, post }) {
  const queryClient = useQueryClient();

  const [content, setContent] = useState(post.content || '');

  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);

  const [removeImage, setRemoveImage] = useState(false);
  const [removeVideo, setRemoveVideo] = useState(false);

  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: updatePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      onClose();
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Post could not be updated.');
    },
  });

  const showOldImage = post.imageUrl && !removeImage && !image && !video;
  const showOldVideo = post.videoUrl && !removeVideo && !image && !video;

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setVideo(null);
  }

  function handleVideoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideo(file);
    setImage(null);
  }

  function handleRemoveMedia() {
    setImage(null);
    setVideo(null);
    if (post.imageUrl) setRemoveImage(true);
    if (post.videoUrl) setRemoveVideo(true);
  }

  function handleSave() {
    setError('');
    mutation.mutate({
      postId: post.id,
      content,
      image,
      video,
      removeImage,
      removeVideo,
    });
  }

  const hasAnyMedia = showOldImage || showOldVideo || image || video;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit post</DialogTitle>

      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TextField
          fullWidth
          multiline
          minRows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          sx={{ mt: 1 }}
        />

        {showOldImage && (
          <Box component="img" src={`${API_ORIGIN}${post.imageUrl}`}
            sx={{ width: '100%', mt: 2, borderRadius: 2 }} />
        )}

        {showOldVideo && (
          <Box component="video" src={`${API_ORIGIN}${post.videoUrl}`} controls
            sx={{ width: '100%', mt: 2, borderRadius: 2 }} />
        )}

        {image && (
          <Box component="img" src={URL.createObjectURL(image)}
            sx={{ width: '100%', mt: 2, borderRadius: 2 }} />
        )}

        {video && (
          <Box component="video" src={URL.createObjectURL(video)} controls
            sx={{ width: '100%', mt: 2, borderRadius: 2 }} />
        )}

        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
          <Button variant="outlined" component="label">
            Change image
            <input hidden type="file" accept="image/*" onChange={handleImageChange} />
          </Button>

          <Button variant="outlined" component="label">
            Change video
            <input hidden type="file" accept="video/*" onChange={handleVideoChange} />
          </Button>

          {hasAnyMedia && (
            <Button color="error" onClick={handleRemoveMedia}>Remove media</Button>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={mutation.isPending}>
          {mutation.isPending ? <CircularProgress size={22} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}