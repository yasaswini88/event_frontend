import React from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress } from '@mui/material';
import { fetchChatbotResponse } from './chatbotFetching'; // Import updated chatbotFetching.js
import SmartToyIcon from '@mui/icons-material/SmartToy';
import Person4Icon from '@mui/icons-material/Person4';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SendIcon from '@mui/icons-material/Send';
import IconButton from '@mui/material/IconButton';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useState, useRef, useEffect } from 'react';


const formatApproverProposals = (dataArray) => {
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    return 'No proposals found or data is unavailable.';
  }
  const latestFive = dataArray.slice(-5);
  let result = 'Here are your Pending proposals (Approver View):\n\n';
  result += latestFive
    .map((item, index) => {
      return (
        `Proposal ${index + 1}:\n` +
        `• ID: ${item.proposalId}\n` +
        `• Item: ${item.itemName}\n` +
        `• Status: ${item.status}\n` +
        `• Requester: ${item.requesterName}`
      );
    })
    .join('\n\n');
  return result;
};

const formatApproverRejected = (dataArray) => {
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    return 'No rejected proposals found or data is unavailable.';
  }
  const latestFive = dataArray.slice(-5);
  let result = 'Here are your Rejected proposals (Approver View):\n\n';
  result += latestFive
    .map((item, index) => {
      return (
        `Proposal ${index + 1}:\n` +
        `• ID: ${item.proposalId}\n` +
        `• Item: ${item.itemName}\n` +
        `• Status: ${item.status}\n` +
        `• Requester: ${item.requesterName}`
      );
    })
    .join('\n\n');
  return result;
};

const formatFacultyProposalsByStatus = (dataArray, status) => {
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    return `No ${status} proposals found or data is unavailable.`;
  }
  const latestFive = dataArray.slice(-5);
  let result = `Here are your ${status} proposals (Faculty View):\n\n`;
  result += latestFive
    .map((item, index) => {
      return (
        `Proposal ${index + 1}:\n` +
        `• ID: ${item.proposalId}\n` +
        `• Item: ${item.itemName}\n` +
        `• Status: ${item.status}\n` +
        (item.orderStatus ? `• Order Status: ${item.orderStatus}\n` : '')
      );
    })
    .join('\n\n');
  return result;
};

const formatFacultyProposals = (dataArray) => {
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    return 'No proposals found or data is unavailable.';
  }
  const latestFive = dataArray.slice(-5);
  let result = 'Here are your proposals (Faculty View):\n\n';
  result += latestFive
    .map((item, index) => {
      return (
        `Proposal ${index + 1}:\n` +
        `• ID: ${item.proposalId}\n` +
        `• Item: ${item.itemName}\n` +
        `• Status: ${item.status}\n` +
        (item.orderStatus ? `• Order Status: ${item.orderStatus}\n` : '')
      );
    })
    .join('\n\n');
  return result;
};

const genericFormat = (dataArray) => {
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    return 'No data found or data is unavailable.';
  }
  const latestFive = dataArray.slice(-5);
  return latestFive
    .map((item, idx) => `Item ${idx + 1} => ${JSON.stringify(item, null, 2)}`)
    .join('\n\n');
};

const Chatbot = ({ userDetails }) => {

  const [userMessage, setUserMessage] = useState('');
  const userId = userDetails?.userId;
  const [chatHistory, setChatHistory] = useState([
    { bot: `Hello, ${userDetails?.firstName} ${userDetails?.lastName}, welcome to UniProcure!` },
  ]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const chatEndRef = useRef(null);

  // Scroll to bottom whenever chatHistory changes
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

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
      const rawResponse = await fetchChatbotResponse(userMessage, userDetails.roles.roleName);
      console.log('Chatbot response (raw):', rawResponse);
  
      let chatbotJSON;
      try {
        chatbotJSON = JSON.parse(rawResponse);
      } catch (errParse) {
        chatbotJSON = null;
      }
  
      let url = null;
      let questionType = null;
  
      if (chatbotJSON && chatbotJSON.metadata) {
        // Clean up questionType
        let questionTypeRaw = chatbotJSON.metadata.QuestionType || "";
        questionType = questionTypeRaw.trim().toLowerCase(); 
  
        // Clean up url
        let urlRaw = chatbotJSON.metadata.apiURL || "";
        url = urlRaw.trim();
      }
  
      // 4) If we have no JSON or no URL => just display raw text from bot
      if (!url) {
        setChatHistory((prev) => [...prev, { user: userMessage, bot: rawResponse }]);
      } else {
        // Replace placeholders
        let finalUrl = url.replace('{approverId}', userId).replace('{userId}', userId);

        // Call the API
        const apiData = await handleApiCall(finalUrl);

        let formattedData = '';
        // Switch on EXACT url from chatbot
        switch (url) {
          case '/api/proposals/approver/{approverId}/status/pending':
            formattedData = formatApproverProposals(apiData);
            break;

          case '/api/proposals/approver/{approverId}/status/Rejected':
            // Now check questionType
            if (questionType === 'How') {
              const count = Array.isArray(apiData) ? apiData.length : 0;
              formattedData = `You have rejected ${count} proposal(s).`;
            } else {
              // "What" => show the standard list
              formattedData = formatApproverRejected(apiData);
            }
            break;

          case '/api/proposals/user/{userId}':
            formattedData = formatFacultyProposals(apiData);
            break;

          case '/api/proposals/faculty/{userId}/status/Approved':
            if (questionType === 'How') {
              const count = Array.isArray(apiData) ? apiData.length : 0;
              formattedData = `You have ${count} approved proposal(s).`;
            } else {
              formattedData = formatFacultyProposalsByStatus(apiData, 'Approved');
            }
            break;

          case '/api/proposals/faculty/{userId}/status/Rejected':
            if (questionType === 'How') {
              const count = Array.isArray(apiData) ? apiData.length : 0;
              formattedData = `You have ${count} rejected proposal(s).`;
            } else {
              formattedData = formatFacultyProposalsByStatus(apiData, 'Rejected');
            }
            break;

          case '/api/proposals/faculty/{userId}/status/Pending':
            if (questionType === 'How') {
              const count = Array.isArray(apiData) ? apiData.length : 0;
              formattedData = `You have ${count} pending proposal(s).`;
            } else {
              formattedData = formatFacultyProposalsByStatus(apiData, 'Pending');
            }
            break;

          default:
            formattedData = genericFormat(apiData);
            break;
        }

        // 5) Show the final text in chat
        setChatHistory((prev) => [...prev, { user: userMessage, bot: formattedData }]);
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
        maxWidth: isMobile ? '95%' : 800, // Full width on mobile
        margin: '0 auto',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: isMobile ? '8px' : '16px', // Reduce padding for mobile
        borderRadius: '16px',
        boxSizing: 'border-box',
      }}
    >

      {/* Chatbot Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 1 : 2,
          marginBottom: isMobile ? 1 : 2,
        }}
      >
        <AutoAwesomeIcon sx={{ fontSize: isMobile ? 30 : 40, color: "#388e3c" }} />
        <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ color: "#388e3c" }}>
          UniProcure Assistant
        </Typography>
      </Box>

      {/* Chat History */}
      <Paper
        elevation={3}
        sx={{
          width: isMobile ? '90%' : '100%', // Reduce width for mobile
          maxHeight: isMobile ? 250 : 400, // Limit height for smaller screens
          overflowY: 'auto',
          padding: isMobile ? 0.5 : 2, // Reduce padding for mobile
          marginBottom: isMobile ? 1 : 2,
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          boxShadow: isMobile ? '0 2px 5px rgba(0,0,0,0.2)' : '0 4px 8px rgba(0,0,0,0.2)',
        }}
      >



        {chatHistory.map((chat, index) => (
          <Box key={index} sx={{ marginBottom: 2 }}>
            {/* User Message */}
            {chat.user && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: 1,
                  marginBottom: 1,
                }}
              >
                <Person4Icon sx={{ color: '#1976d2', fontSize: isMobile ? 20 : 24 }} />
                <Box
                  sx={{
                    maxWidth: isMobile ? '90%' : '75%',

                    padding: isMobile ? 1 : 1.5,
                    borderRadius: 3,
                    backgroundColor: '#1a237e',
                    color: '#fff',
                    textAlign: 'right',
                  }}
                >
                  <Typography variant={isMobile ? "body2" : "body1"}>{chat.user}</Typography>
                </Box>
              </Box>

            )}
            {/* Bot Message */}
            {chat.bot && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: 1,
                  marginBottom: 1,
                }}
              >
                <SmartToyIcon sx={{ color: '#555' }} />

                <Typography variant="body1" sx={{
                  maxWidth: isMobile ? '90%' : '75%',

                  padding: 1.5,
                  borderRadius: 3,
                  backgroundColor: '#e0e0e0',
                  color: '#000',
                  textAlign: 'left',
                  whiteSpace: 'pre-line',
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
        <div ref={chatEndRef} />
      </Paper>

      {/* Error Message */}
      {error && <Typography color="error" variant="body2">{error}</Typography>}

      {/* Input Field and Send Button */}
      <Box
        display="flex"
        width={isMobile ? "95%" : "100%"} // Adjust width for mobile
        gap={isMobile ? 1 : 2} // Reduce gap on smaller screens
      >

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
