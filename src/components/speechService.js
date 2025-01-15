// src/speechService.js
import axios from 'axios';

export const convertSpeechToText = async (base64Audio) => {
  // calls your Spring Boot endpoint: /api/speech/speech-to-text
  try {
    const response = await axios.post('/api/speech/speech-to-text', {
      audioContent: base64Audio,
    });
    return response.data; // Should be the transcribed text
  } catch (err) {
    console.error('Error in convertSpeechToText:', err);
    throw err;
  }
};

export const convertTextToSpeech = async (text) => {
  // calls your Spring Boot endpoint: /api/speech/text-to-speech
  try {
    const response = await axios.post('/api/speech/text-to-speech', {
      text: text,
    });
    // Response shape is { audioContent: '...', error: null }
    return response.data;
  } catch (err) {
    console.error('Error in convertTextToSpeech:', err);
    throw err;
  }
};
