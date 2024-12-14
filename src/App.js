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
import './App.css';

// Set axios default base URL
axios.defaults.baseURL = `http://174.129.138.174:8080`;

function App() {
  // Replace localStorage with Redux state
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Begin />} />
          <Route path="/signup" element={
            <>
              <CommonAppBar showLogout={false} />
              <SignUp />
            </>
          } />
          <Route path="/login" element={
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
              <ProtectedLayout requiredRole="Approver">
                <ApproverDashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/purchaser-dashboard"
            element={
              <ProtectedLayout requiredRole="Purchaser">
                <PurchaserDashboard />
              </ProtectedLayout>
            }
          />


          {/* Protected User routes */}
          {/* <Route 
            path="/proposal" 
            element={
              <ProtectedLayout>
                <ProposalForm />
              </ProtectedLayout>
            } 
          /> */}
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
              <ProtectedLayout requiredRole="Admin">
                <AdminDashboard />
              </ProtectedLayout>
            }
          />

          <Route
            path="/admin/procurements"
            element={
              <ProtectedLayout requiredRole="Admin">
                <Procurements />
              </ProtectedLayout>
            }
          />

          <Route
            path="/admin/approvers"
            element={
              <ProtectedLayout requiredRole="Admin">
                <AdminApprover />
              </ProtectedLayout>
            }
          />


          {/* Catch all route */}
          <Route
            path="*"
            element={
              <Navigate
                to={user ?
                  (user.roles?.roleName === 'Admin' ? '/admin-dashboard' :
                    user.roles?.roleName === 'Approver' ? '/approver-dashboard' :
                      user.roles?.roleName === 'Purchaser' ? '/purchaser-dashboard' :
                        '/proposal')
                  : '/login'}
              />
            }
          />

        </Routes>
        {/* Add FloatingChatButton after login */}
        {user && isAuthenticated && (
          <FloatingChatButton userDetails={user} />
        )}

      </div>
    </Router>
  );
}

export default App;