import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import SignUp from './components/Signup';
import Login from './components/Login';
import Begin from './components/Begin';
import ForgotPassword from './components/ForgotPassword';
import VerifyCode from './components/VerifyCode';
import ResetPassword from './components/ResetPassword';
import Events from './components/Events';
import EventDialog from './components/EventDialog';
import ProposalForm from './components/ProposalForm';
import ApproverDashboard from './components/ApproverDashboard';
import PurchaserDashboard from './components/PurchaserDashboard';
import ProtectedLayout from './components/ProtectedLayout';
import ProtectedApproverRoute from './components/ProtectedApproverRoute';
import ProposalsList from './components/ProposalsList';
import CommonAppBar from './components/CommonAppBar';
import ProtectedPurchaserRoute from './components/ProtectedPurchaserRoute';
import FloatingChatButton from './components/FloatingChatButton';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import AdminDashboard from './components/AdminDashboard';
import Procurements from './components/Procurements';
import AdminApprover from './components/AdminApprover';
import SetBudgets from './components/SetBudgets';
import './App.css';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import SingleProposalView from './components/SingleProposalView';
import MenuIcon from '@mui/icons-material/Menu';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';





// Set axios default base URL


// axios.defaults.baseURL = `http://18.234.73.35:8080`;
axios.defaults.baseURL = 'https://oneaiforall.com';


function App() {
  // Replace localStorage with Redux state
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));



  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Router>
        <div className="App">
          {/* {shouldShowAppBar && <CommonAppBar showLogout={false} />} */}
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Begin />} />
            <Route path="/signup" element={
              <>
                <CommonAppBar showLogout={false} />
                <SignUp />
              </>
            } />
            <Route path="/" element={
              <>
                <CommonAppBar showLogout={false} />
                <Login />
              </>
            } />
            <Route path="/forgot-password" element={
              <>
                <CommonAppBar showLogout={false} />
                <ForgotPassword />
              </>
            } />
            <Route path="/verify-code" element={
              <>
                <CommonAppBar showLogout={false} />
                <VerifyCode />
              </>
            } />
            <Route path="/reset-password" element={
              <>
                <CommonAppBar showLogout={false} />
                <ResetPassword />
              </>
            } />

            {/* Protected Approver routes */}
            <Route
              path="/approver-dashboard"
              element={
                <ProtectedLayout requiredRoleId={3}>
                  <ApproverDashboard />
                </ProtectedLayout>
              }
            />
            <Route
              path="/purchaser-dashboard"
              element={
                <ProtectedLayout requiredRoleId={4}>
                  <PurchaserDashboard />
                </ProtectedLayout>
              }
            />



            <Route
              path="/proposal/:proposalId"
              element={
                <ProtectedLayout>
                  <SingleProposalView />
                </ProtectedLayout>
              }
            />


            <Route
              path="/proposal"
              element={
                <ProtectedLayout>
                  <ProposalsList />
                </ProtectedLayout>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedLayout>
                  <Events />
                </ProtectedLayout>
              }
            />
            <Route
              path="/event-dialog"
              element={
                <ProtectedLayout>
                  <EventDialog />
                </ProtectedLayout>
              }
            />
            <Route
              path="/purchaser-dashboard"
              element={
                <ProtectedLayout>
                  <PurchaserDashboard />
                </ProtectedLayout>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedLayout requiredRoleId={1}>
                  <AdminDashboard />
                </ProtectedLayout>
              }
            />

            <Route
              path="/admin/procurements"
              element={
                <ProtectedLayout requiredRoleId={1}>
                  <Procurements />
                </ProtectedLayout>
              }
            />

            <Route
              path="/admin/approvers"
              element={
                <ProtectedLayout requiredRoleId={1}>
                  <AdminApprover />
                </ProtectedLayout>
              }
            />

            <Route
              path="/admin/budgets"
              element={
                <ProtectedLayout requiredRoleId={1}>

                  <SetBudgets />
                </ProtectedLayout>
              }
            />





            <Route
              path="*"
              element={
                <Navigate
                  to={
                    user
                      ? (
                          
                          user.roles.some(r => r.roleId === 1) ? '/admin-dashboard'
                        : user.roles.some(r => r.roleId === 3) ? '/approver-dashboard'
                        : user.roles.some(r => r.roleId === 4) ? '/purchaser-dashboard'
                        : '/proposal'
                      )
                      : '/'
                  }
                />
              }
            />


          </Routes>
          {/* Add FloatingChatButton after login */}
          {user && isAuthenticated && (
            <FloatingChatButton
              userDetails={user}
              sx={{
                position: 'fixed',
                bottom: isMobile ? '16px' : '24px',
                right: isMobile ? '16px' : '24px',
                zIndex: 1000
              }}
            />
          )}

        </div>
      </Router>
    </LocalizationProvider>
  );
}

export default App;