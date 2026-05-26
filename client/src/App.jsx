import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Explore from './pages/Explore';
import About from './pages/About';
import PostDetail from './pages/PostDetail';
import AuthorProfile from './pages/AuthorProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WritePost from './pages/WritePost';
import EditPost from './pages/EditPost';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import PrivateRoute from './components/PrivateRoute';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background flex flex-col text-text-primary">
          <Navbar />
          <div className="flex-1">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/about" element={<About />} />
              <Route path="/post/:slug" element={<PostDetail />} />
              <Route path="/author/:username" element={<AuthorProfile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/write" element={<WritePost />} />
                <Route path="/edit/:id" element={<EditPost />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
          <Toaster 
            position="top-right" 
            toastOptions={{
              duration: 3000,
              style: {
                background: '#FFFFFF',
                color: '#111827',
                border: '1px solid rgba(17, 24, 39, 0.08)',
                fontFamily: 'Outfit, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
              }
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
