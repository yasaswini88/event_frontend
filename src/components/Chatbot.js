import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress } from '@mui/material';
import { fetchChatbotResponse } from './chatbotFetching'; // Import updated chatbotFetching.js
import SmartToyIcon from '@mui/icons-material/SmartToy';
import Person4Icon from '@mui/icons-material/Person4';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SendIcon from '@mui/icons-material/Send';
import IconButton from '@mui/material/IconButton';
import axios from 'axios';

const Chatbot = ({ userDetails }) => {

  const [userMessage, setUserMessage] = useState('');
  const userId = userDetails?.userId;
  const [chatHistory, setChatHistory] = useState([
    { bot: `Hello, ${userDetails?.firstName} ${userDetails?.lastName}, welcome to UniProcure!` },
  ]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);

  // Function to dynamically handle API calls
  const handleApiCall = async (url) => {
    try {
      const response = await axios.get(url);
      return response.data; // Return the API data
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
      return 'Failed to fetch data. Please try again.';
    }
  };

  const handleSendMessage = async () => {
    if (!userMessage) return;

    setLoading(true);
    setTyping(true);
    setError(null);

    try {
      // Fetch chatbot response and pass user role dynamically
      const response = await fetchChatbotResponse(userMessage, userDetails.roles.roleName);
      console.log('Chatbot response:', response);

      // Extract API URL from chatbot response
      const urlMatch = response.match(/"apiURL"\s*:\s*"([^"]+)"/);
      const url = urlMatch ? urlMatch[1] : null;

      if (url) {
        const dynamicUrl = url.replace('{userId}', userId); // Replace {userId} dynamically
        const apiData = await handleApiCall(dynamicUrl);



        // Format API data for better readability
        const formattedData = Array.isArray(apiData)
          ? apiData
            .map(
              (item, index) =>
                `Proposal ${index + 1}:\n` +
                `- Item Name: ${item.itemName}\n` +
                `- Status: ${item.status}`
            )
            .join('\n\n')
          : 'No proposals found or data is unavailable.';

        console.log(formattedData);

        // Update chat history with formatted API data
        setChatHistory([
          ...chatHistory,
          { user: userMessage, bot: formattedData },
        ]);
      } else {
        // Handle plain chatbot responses
        setChatHistory([...chatHistory, { user: userMessage, bot: response }]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setTyping(false);
      setUserMessage('');
    }
  };


  return (
    <div
      style={{
        maxWidth: 900,
        margin: '0 auto',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        // backgroundColor: '#f9f9f9',
        padding: '16px',
        borderRadius: '16px',
      }}
    >
      {/* Chatbot Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          marginBottom: 2,
        }}
      >
        <AutoAwesomeIcon sx={{ fontSize: 40, color: "#388e3c" }} />
        <Typography variant="h6" sx={{ color: "#388e3c" }}>
          UniProcure Assistant
        </Typography>
      </Box>

      {/* Chat History */}
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          maxHeight: 400,
          overflowY: 'auto',
          padding: 2,
          marginBottom: 2,
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
        }}
      >
        {chatHistory.map((chat, index) => (
          <Box key={index} sx={{ marginBottom: 2 }}>
            {/* User Message */}
            {chat.user && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: 1,
                  marginBottom: 1,
                }}
              >
                <Person4Icon sx={{ color: '#1976d2' }} />
                <Box
                  sx={{
                    maxWidth: '75%',
                    padding: 1.5,
                    borderRadius: 3,
                    backgroundColor: '#1a237e',
                    color: '#fff',
                    textAlign: 'right',
                  }}
                >
                  <Typography variant="body1">{chat.user}</Typography>
                </Box>
              </Box>
            )}
            {/* Bot Message */}
            {chat.bot && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <SmartToyIcon sx={{ color: '#555' }} />

                <Typography variant="body1" sx={{
                  maxWidth: '75%',
                  padding: 1.5,
                  borderRadius: 3,
                  backgroundColor: '#e0e0e0',
                  color: '#000',
                  textAlign: 'left',
                }} >{chat.bot}</Typography>

              </Box>
            )}
          </Box>
        ))}
        {/* Typing Indicator */}
        {typing && (
          <Typography variant="body2" sx={{ textAlign: 'left', marginTop: 1 }}>
            <em>Bot is typing...</em>
          </Typography>
        )}
      </Paper>

      {/* Error Message */}
      {error && <Typography color="error" variant="body2">{error}</Typography>}

      {/* Input Field and Send Button */}
      <Box display="flex" width="100%" gap={2}>
        <TextField
          label="Type your message"
          variant="outlined"
          fullWidth
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          disabled={loading}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': {
                borderColor: '#388e3c',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#388e3c',
            },
          }}
        />
        <IconButton
          color="primary"
          onClick={handleSendMessage}
          disabled={loading || !userMessage}
          sx={{
            '&:hover': {
              backgroundColor: '#2e7d32',
            },
            color: '#388e3c',
          }}
        >
          {loading ? <CircularProgress size={24} /> : <SendIcon />}
        </IconButton>
      </Box>
    </div>
  );
};

export default Chatbot;
