import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from './api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', patientId: '', roomNumber: '' });
  
  // 1. New Loading State
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isRegister ? '/register' : '/login';
    
    // 2. Start Loading (Shows spinner)
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_URL}${endpoint}`, formData);
      login(res.data);
      if (res.data.email.includes('admin')) navigate('/admin'); 
      else navigate('/'); 
    } catch (err) { 
      alert('Authentication Failed'); 
    } finally {
      // 3. Stop Loading (Hides spinner whether success or fail)
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h1 className="login-header">{isRegister ? 'Register' : 'Login'}</h1>
        
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <input className="custom-input" placeholder="Full Name" onChange={e => setFormData({...formData, name: e.target.value})} required />
              <input className="custom-input" placeholder="Patient ID" onChange={e => setFormData({...formData, patientId: e.target.value})} required />
              <input className="custom-input" placeholder="Room Number" onChange={e => setFormData({...formData, roomNumber: e.target.value})} required />
            </>
          )}
          
          <input className="custom-input" type="email" placeholder="Username or Email" onChange={e => setFormData({...formData, email: e.target.value})} required />
          <input className="custom-input" type="password" placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} required />
          
          {/* 4. Button is disabled while loading */}
          <button type="submit" className="btn-gradient" disabled={isLoading}>
            {isLoading ? 'CONNECTING...' : (isRegister ? 'SIGN UP' : 'LOG IN')}
          </button>
        </form>

        {/* 5. The Spinner and Message */}
        {isLoading && (
            <div className="loading-container">
                <div className="spinner"></div>
                <p style={{fontSize: '0.85rem', color: '#666', marginTop: '10px'}}>
                   Waking up the server...<br/>
                   (This takes 30-50s on the first try!)
                </p>
            </div>
        )}

        <p className="link-text">
          {isRegister ? 'Already a member?' : 'Not a member?'} 
          {/* Prevent switching modes while loading */}
          <span onClick={() => !isLoading && setIsRegister(!isRegister)} style={{ cursor: isLoading ? 'default' : 'pointer' }}>
            {isRegister ? 'Login now' : 'Sign up now'}
          </span>
        </p>
      </div>
    </div>
  );
}