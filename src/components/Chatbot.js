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
import MicIcon from '@mui/icons-material/Mic';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { convertSpeechToText, convertTextToSpeech } from './speechService';
import PauseIcon from '@mui/icons-material/Pause';


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

  const beepStart = new Audio('/beep-start.mp3');
const beepStop = new Audio('/beep-stop.mp3');


  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const chatEndRef = useRef(null);

  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [transcription,setTranscription] = useState('');
  const[currentAudio,setCurrentAudio] = useState(null);

 
 
  const audioBlobToBase64 = async (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const arrayBuffer = reader.result;
        const base64Audio = btoa(
          new Uint8Array(arrayBuffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );
        resolve(base64Audio);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
  };


  const startRecording = async () => {
    try {
    
      beepStart.play().catch(err => {
        console.warn('Beep Start error:', err);
      });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      //recorder.start();
      console.log('Recorder created:', recorder);
      recorder.addEventListener('dataavailable', async (event) => {
        console.log('Recorder created:', recorder);
        if(!event.data) return;
        const audioBlob = event.data;
        console.log('Audio blob:', audioBlob);
        const base64Audio = await audioBlobToBase64(audioBlob);
        console.log('Base64 audio:', base64Audio);
        try{
          const startTime = performance.now();
          const response = await axios.post(
            'https://speech.googleapis.com/v1/speech:recognize?key=AIzaSyCRWbaVwoYMMwQSY-XGkxUwE80xwskZgCM',
            {
              config: {
                encoding: 'WEBM_OPUS',
                sampleRateHertz: 48000,
                languageCode: 'en-US',
              },
              audio: {
                content: base64Audio,
              },
            }
          );
          const endTime = performance.now();
          console.log('STT response:', response.data);
          const elapsedTime = ((endTime - startTime));
          if(response.data.results && response.data.results.length > 0){
            console.log("transcription",response.data.results[0].alternatives[0].transcript);
            setTranscription(response.data.results[0].alternatives[0].transcript);
            setUserMessage(response.data.results[0].alternatives[0].transcript);
          }else{
            setTranscription('No transcription found');
          }
        }catch(err){
          console.error('Error in STT:', err);
        }
        if (event.data.size > 0) {
          setAudioChunks((prev) => [...prev, event.data]);
        }
      });
      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
      console.log('Recording started...');
    } catch (err) {
      console.error('Error accessing mic:', err);
    }
  };
  // 2) Stop Recording & Send to STT
  const stopRecording = () => {
    console.log('Stopping recording...'+transcription);
    if (!mediaRecorder) return;

    beepStop.play().catch(err => {
      console.warn('Beep Stop error:', err);
    });

    mediaRecorder.stop();
    setRecording(false);
    console.log('Recording stopped.');
  };


  // useEffect(() => {
  //   if (!recording && audioChunks.length > 0) {
  //     const blob = new Blob(audioChunks, { type: 'audio/wav' });
  //     const reader = new FileReader();
  //     reader.onloadend = async () => {
  //       // "data:audio/wav;base64,AAA..."
  //       const base64Data = reader.result.split(',')[1];
  //       try {
  //         const recognizedText = await convertSpeechToText(base64Data);

  //         console.log('STT recognized text:', recognizedText);
  //         console.log('STT recognized text:', recognizedText);

  //         // // Optionally auto-send recognized text as user message
  //         // setUserMessage(recognizedText);
  //         // handleSendMessage(recognizedText);
  //         setUserMessage(recognizedText);

  //       } catch (err) {
  //         console.error('Speech-to-text error:', err);
  //       }
  //       setAudioChunks([]); // reset
  //     };
  //     reader.readAsDataURL(blob);
  //   }
  // }, [recording, audioChunks]);



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

  const handleSendMessage = async (msgFromSTT = null) => {
    // if (!userMessage) return;
    const message = msgFromSTT || userMessage;

    if (!message) return;

    console.log('User is sending text =>', message);

    setLoading(true);
    setTyping(true);
    setError(null);

    
    try {
      const rawResponse = await fetchChatbotResponse(message, userDetails.roles.roleName);
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
        setChatHistory((prev) => [...prev, { user: message, bot: rawResponse }]);
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
        setChatHistory((prev) => [...prev, { user: message, bot: formattedData }]);
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


  const speakBotMessage = async (text) => {
    try {
      if(currentAudio){
        currentAudio.pause();
        setCurrentAudio(null);
        return;
      }
      const ttsResponse = await convertTextToSpeech(text);
      if (ttsResponse.audioContent) {
        const base64Audio = ttsResponse.audioContent;
        const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
        setCurrentAudio(audio);
        audio.play();
        audio.onended = () => {
          setCurrentAudio(null);
        };
      } else if (ttsResponse.error) {
        console.error('TTS error:', ttsResponse.error);
      }
    } catch (err) {
      console.error('Error in speakBotMessage:', err);
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

                {/* <Typography variant="body1" sx={{
                  maxWidth: isMobile ? '90%' : '75%',

                  padding: 1.5,
                  borderRadius: 3,
                  backgroundColor: '#e0e0e0',
                  color: '#000',
                  textAlign: 'left',
                  whiteSpace: 'pre-line',
                }} >{chat.bot}</Typography> */}
                <Box
                  sx={{
                    maxWidth: isMobile ? '90%' : '75%',
                    padding: 1.5,
                    borderRadius: 3,
                    backgroundColor: '#e0e0e0',
                    color: '#000',
                    textAlign: 'left',
                    whiteSpace: 'pre-line',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Typography variant="body1" sx={{ flexGrow: 1 }}>
                    {chat.bot}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => speakBotMessage(chat.bot)}
                  >
                    {currentAudio ? <PauseIcon /> : <VolumeUpIcon />}
                   
                  </IconButton>
                </Box>
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

        <IconButton
          color="primary"
          onClick={() => {
            if (!recording) startRecording();
            else stopRecording();
          }}
        >
          <MicIcon />
        </IconButton>

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
          // onClick={handleSendMessage}
          onClick={() => handleSendMessage()}
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
