import { useState } from 'react';
import { TextField, Button, Select, MenuItem, InputLabel, FormControl, Box, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Container } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Home() {
  const [fileEntries, setFileEntries] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const newFileEntries = Array.from(event.target.files).map((file) => {
      // Check if the file format is correct
      const isCorrectFormat = file.name.endsWith(`.${selectedFormat}`);
      return {
        file,
        comment: '',
        id: Math.random().toString(36).substring(2, 11), // Generate a pseudo-random ID
        error: isCorrectFormat ? '' : 'Wrong file format selected.',
      };
    });

    // Filter out files with incorrect format
    const correctFormatFiles = newFileEntries.filter(entry => !entry.error);

    // Update error if there are files with the wrong format
    if (correctFormatFiles.length !== newFileEntries.length) {
      setError('Some files have the wrong format and were not added.');
    } else {
      setError('');
    }

    setFileEntries([...fileEntries, ...correctFormatFiles]);
  };

  const handleCommentChange = (id, comment) => {
    setFileEntries(fileEntries.map(entry => {
      if (entry.id === id) {
        return { ...entry, comment };
      }
      return entry;
    }));
  };

  const removeFile = (id) => {
    setFileEntries(fileEntries.filter(entry => entry.id !== id));
  };

  const uploadFile = async (fileEntry) => {
    const { file, comment } = fileEntry;
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result;
        const filename = file.name;
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ file: base64, filename, comment }),
        });
        const data = await response.json();
        console.log(data);
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        setError(`Error reading file: ${file.name}`);
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(`Error uploading file: ${file.name}`);
    }
  };

  const uploadAllFiles = () => {
    fileEntries.forEach(uploadFile);
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          mt: 8,
        }}
      >
        <FormControl fullWidth margin="normal">
          <InputLabel id="format-select-label">Choose Format</InputLabel>
          <Select
            labelId="format-select-label"
            id="format-select"
            value={selectedFormat}
            label="Choose Format"
            onChange={(e) => setSelectedFormat(e.target.value)}
          >
            <MenuItem value="mp4">.mp4</MenuItem>
            <MenuItem value="mp3">.mp3</MenuItem>
            <MenuItem value="jpeg">.jpeg</MenuItem>
            <MenuItem value="png">.png</MenuItem>
            <MenuItem value="flv">.flv</MenuItem>
            <MenuItem value="mkv">.mkv</MenuItem>
            <MenuItem value="jpg">.jpg</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          component="label"
          fullWidth
          margin="normal"
        >
          Choose File
          <input
            type="file"
            hidden
            multiple
            onChange={handleFileChange}
          />
        </Button>

        <List>
          {fileEntries.map((entry) => (
            <ListItem key={entry.id}>
              <ListItemText
                primary={entry.file.name}
                secondary={entry.error && <span style={{ color: 'red' }}>{entry.error}</span>}
                sx={{mr:"80px"}}
              />
              <TextField
                size="small"
                variant="outlined"
                placeholder="Enter a comment (optional)"
                value={entry.comment}
                onChange={(e) => handleCommentChange(entry.id, e.target.value)}
                margin="normal"
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="delete" onClick={() => removeFile(entry.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        <Button variant="contained" color="primary" onClick={uploadAllFiles} fullWidth>
          Upload All
        </Button>
        {error && <Box color="error.main">{error}</Box>}
      </Box>
    </Container>
  );
}
