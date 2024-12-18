import React, { useState } from 'react';
import { Fab, Dialog, DialogContent, Avatar } from '@mui/material';  // Import Avatar
import Chatbot from './Chatbot';  // Make sure this points to your actual Chatbot component
import { useSelector } from 'react-redux';

const FloatingChatButton = ({ userDetails }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const handleChatOpen = () => {
    setChatOpen(true);
  };

  const handleChatClose = () => {
    setChatOpen(false);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button (Chatbot) */}
      <Fab
        color="primary"
        aria-label="chat"
        onClick={handleChatOpen}
        sx={{ position: 'fixed', bottom: 35, right: 35 }} // Adjusts position to bottom-right
      >
        {/* Replace ChatIcon with Avatar */}
        <Avatar
          alt="Chatbot"
          src="https://media.istockphoto.com/id/1445426863/vector/chat-bot-vector-logo-design-concept.jpg?s=612x612&w=0&k=20&c=XDdfzS4lNW9yxQ0BQGZq9KMLL4bJ8ywXlYdAhBSuoCA="
          sx={{ width: '80px', height: '80px', borderRadius: '16px' }}  // Adjust size of the avatar
        />
      </Fab>

      {/* Chatbot dialog */}
      <Dialog open={chatOpen} onClose={handleChatClose}
       
       PaperProps={{
         sx: {
           position: 'fixed',
           bottom: 80,  // Adjust to place the dialog above the FAB
           right: 16,   // Aligns with the FAB's right position
           m: 0,        // No margin
           width: 'auto',  // Adjust the width as per your needs
           maxWidth: '800px',  // Adjust the maximum width as per your needs
           borderRadius: '16px',
         },
       }}>
        <DialogContent>
          <Chatbot userDetails={userDetails} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingChatButton;