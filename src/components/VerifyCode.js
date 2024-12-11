
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { LockOutlined as LockIcon } from "@mui/icons-material";

const VerifyCode = () => {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await axios.post("/api/verify-code", {
        email: location.state?.email,
        code,
      });
      
      setMessage("Code verified, proceed to reset password.");
      
      
      setTimeout(() => {
        navigate("/reset-password", { 
          state: { email: location.state?.email } 
        });
      }, 1500);
    } catch (error) {
      setMessage("Invalid or expired code.");
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if no email in state
  if (!location.state?.email) {
    navigate("/forgot-password");
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#e8dede",
        py: 12,
        px: 2,
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
          {/* Lock Icon */}
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              bgcolor: "#6c63ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <LockIcon sx={{ color: "white" }} />
          </Box>

          <Typography
            component="h1"
            variant="h5"
            gutterBottom
            sx={{ fontWeight: 600, mb: 3 }}
          >
            Verify Passcode
          </Typography>

          <Typography 
            variant="body2" 
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 4 }}
          >
            Please enter the 4-digit code sent to your email
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <TextField
              required
              fullWidth
              label="Verification Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputProps={{
                maxLength: 4,
                pattern: "[0-9]*",
                inputMode: "numeric",
              }}
              placeholder="Enter 4-digit code"
              sx={{ mb: 3 }}
            />

            {message && (
              <Alert 
                severity={message.includes("verified") ? "success" : "error"}
                sx={{ mb: 2 }}
              >
                {message}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={code.length !== 4 || isLoading}
              sx={{
                py: 1.5,
                bgcolor: "#6c63ff",
                "&:hover": {
                  bgcolor: "#5848d9",
                },
                position: "relative",
              }}
            >
              {isLoading ? (
                <CircularProgress
                  size={24}
                  sx={{
                    position: "absolute",
                    color: "primary.light",
                  }}
                />
              ) : (
                "Verify Code"
              )}
            </Button>

            {/* Optional: Add a resend code option */}
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
              >
                Didn't receive the code?{" "}
                <Button
                  variant="text"
                  size="small"
                  onClick={() => {
                    navigate("/forgot-password");
                  }}
                  sx={{
                    color: "#6c63ff",
                    textTransform: "none",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Resend Code
                </Button>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default VerifyCode;
