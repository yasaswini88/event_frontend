import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
  Container,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import {
  CheckCircleOutline as CheckIcon,
  CancelOutlined as CrossIcon,
  LockOutlined as LockIcon,
} from "@mui/icons-material";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValid, setPasswordValid] = useState({
    length: false,
    specialChar: false,
    uppercase: false,
    match: false,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const validatePassword = (password, confirmPwd = confirmPassword) => {
    const lengthValid = password.length >= 8;
    const specialCharValid = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const uppercaseValid = /[A-Z]/.test(password);
    const matchValid = password === confirmPwd;

    setPasswordValid({
      length: lengthValid,
      specialChar: specialCharValid,
      uppercase: uppercaseValid,
      match: matchValid,
    });

    return lengthValid && specialCharValid && uppercaseValid && matchValid;
  };

  const handlePasswordChange = (e) => {
    const newPwd = e.target.value;
    setNewPassword(newPwd);
    validatePassword(newPwd);
  };

  const handleConfirmPasswordChange = (e) => {
    const confirmPwd = e.target.value;
    setConfirmPassword(confirmPwd);
    validatePassword(newPassword, confirmPwd);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const email = location.state?.email;
    if (!email) {
      setMessage("Error: Email not found.");
      return;
    }

    if (!validatePassword(newPassword, confirmPassword)) {
      setMessage("Please ensure all password requirements are met.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('/api/reset-password', {
        email,
        newPassword,
        confirmPassword,
      });

      setMessage(response.data.message);
      if (response.status === 200) {
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Error resetting password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const ValidationListItem = ({ isValid, text }) => (
    <ListItem dense disableGutters>
      <ListItemIcon sx={{ minWidth: 36 }}>
        {isValid ? (
          <CheckIcon color="success" fontSize="small" />
        ) : (
          <CrossIcon color="error" fontSize="small" />
        )}
      </ListItemIcon>
      <ListItemText
        primary={text}
        primaryTypographyProps={{
          variant: "body2",
          color: isValid ? "success.main" : "error.main",
        }}
      />
    </ListItem>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: (theme) => theme.palette.grey[100],
        py: 12,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={4}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: 2,
          }}
        >
          {/* Icon Header */}
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <LockIcon sx={{ color: "white" }} />
          </Box>

          <Typography
            variant="h5"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            Create new password
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 4 }}
          >
            Please ensure your new password meets all the requirements below.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <TextField
              fullWidth
              label="New Password"
              type="password"
              variant="outlined"
              value={newPassword}
              onChange={handlePasswordChange}
              required
              disabled={isLoading}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              variant="outlined"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              required
              disabled={isLoading}
              sx={{ mb: 3 }}
            />

            <List sx={{ mb: 3 }}>
              <ValidationListItem
                isValid={passwordValid.length}
                text="At least 8 characters long"
              />
              <ValidationListItem
                isValid={passwordValid.specialChar}
                text="Contains at least 1 special character"
              />
              <ValidationListItem
                isValid={passwordValid.uppercase}
                text="Contains at least 1 uppercase letter"
              />
              <ValidationListItem
                isValid={passwordValid.match}
                text="Passwords match"
              />
            </List>

            {message && (
              <Alert 
                severity={message.toLowerCase().includes("success") ? "success" : "error"}
                sx={{ mb: 3 }}
              >
                {message}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading || !Object.values(passwordValid).every(Boolean)}
              sx={{
                py: 1.5,
                position: "relative",
                bgcolor: theme.palette.primary.main,
                "&:hover": {
                  bgcolor: theme.palette.primary.dark,
                },
              }}
            >
              {isLoading ? (
                <CircularProgress
                  size={24}
                  sx={{
                    position: "absolute",
                    color: theme.palette.primary.light,
                  }}
                />
              ) : (
                "Reset Password"
              )}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ResetPassword;