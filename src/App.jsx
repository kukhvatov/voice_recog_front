import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import {
  Container,
  Typography,
  CircularProgress,
  Paper,
  Box,
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
      'audio/*': ['.mp3', '.wav', '.aac', '.ogg', '.flac', '.m4a']
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

      // Указываем responseType: 'text' для получения текстового ответа
      const response = await axios.post('http://185.137.233.217/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'text'  // Важно: запрашиваем текстовый ответ
      });

      // Сохраняем текст ответа как есть
      setResult(response.data);
    } catch (err) {
      console.error("Error details:", err);

      let errorMessage = 'Ошибка при обработке файла';
      if (err.response) {
        // Пытаемся получить текстовое сообщение об ошибке
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data?.detail) {
          errorMessage = err.response.data.detail;
        }
      }

      setError(errorMessage);
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
          Поддерживаемые форматы: MP3, WAV, AAC, OGG, FLAC, M4A
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

          {/* Используем pre-wrap для сохранения переносов строк */}
          <Typography
            component="div"
            sx={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              backgroundColor: '#f5f5f5',
              padding: '16px',
              borderRadius: '4px',
              marginTop: '16px'
            }}
          >
            {result}
          </Typography>
        </Paper>
      )}
    </Container>
  );
}