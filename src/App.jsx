// src/App.jsx
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import {
  Container,
  Typography,
  CircularProgress,
  Paper,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Alert
} from '@mui/material';
import { styled } from '@mui/system';

const Dropzone = styled('div')({
  border: '2px dashed #1976d2',
  borderRadius: '8px',
  padding: '40px',
  textAlign: 'center',
  cursor: 'pointer',
  margin: '20px 0',
  backgroundColor: '#f5faff',
  '&:hover': {
    backgroundColor: '#e3f2fd'
  }
});

export default function App() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'audio/*': ['.mp3', '.wav', '.aac', '.ogg']
    },
    multiple: false,
    onDrop: files => handleUpload(files[0])
  });

  const handleUpload = async file => {
    try {
      setUploading(true);
      setError(null);
      setResult(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('http://185.137.233.217:80/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка при обработке файла');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom align="center">
        Аудио в текст
      </Typography>

      <Dropzone {...getRootProps()}>
        <input {...getInputProps()} />
        <Typography variant="h6">
          Перетащите аудиофайл сюда или кликните для выбора
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Поддерживаемые форматы: MP3, WAV, AAC, OGG
        </Typography>
      </Dropzone>

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}

      {uploading && (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Обработка аудио...
          </Typography>
        </Box>
      )}

      {result && (
        <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
          <Typography variant="h5" gutterBottom>
            Результат транскрипции:
          </Typography>

          <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
            {result.text}
          </Typography>

          <Typography variant="h6" sx={{ mt: 3 }}>
            Детализация:
          </Typography>

          <List dense>
            {result.segments.map((segment, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={segment.text}
                  secondary={`${segment.start.toFixed(1)}s - ${segment.end.toFixed(1)}s`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
}