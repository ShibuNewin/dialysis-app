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
  const [isLoading, setIsLoading] = useState(false);

  // --- NEW: DEMO LOGIN FUNCTION ---
  const handleDemoLogin = () => {
    // 1. Switch to Login mode automatically
    setIsRegister(false);
    
    // 2. Fill the form with your Demo Credentials
    // TODO: CHANGE THESE TO A REAL USER FROM YOUR DATABASE
    setFormData({
      ...formData,
      email: 'admin@hospital.com', 
      password: 'admin123'         
    });
  };
  // --------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isRegister ? '/register' : '/login';
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_URL}${endpoint}`, formData);
      login(res.data);
      if (res.data.email.includes('admin')) navigate('/admin'); 
      else navigate('/'); 
    } catch (err) { 
      alert('Authentication Failed'); 
    } finally {
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
          
          <input 
            className="custom-input" 
            type="email" 
            placeholder="Username or Email" 
            value={formData.email} // Added value binding so the Demo button works
            onChange={e => setFormData({...formData, email: e.target.value})} 
            required 
          />
          <input 
            className="custom-input" 
            type="password" 
            placeholder="Password" 
            value={formData.password} // Added value binding so the Demo button works
            onChange={e => setFormData({...formData, password: e.target.value})} 
            required 
          />
          
          <button type="submit" className="btn-gradient" disabled={isLoading}>
            {isLoading ? 'CONNECTING...' : (isRegister ? 'SIGN UP' : 'LOG IN')}
          </button>

          {/* --- NEW: DEMO BUTTON --- */}
          {!isRegister && !isLoading && (
            <button 
              type="button" 
              onClick={handleDemoLogin}
              style={{
                marginTop: '15px',
                background: 'transparent',
                border: '2px dashed #2c5364',
                color: '#2c5364',
                padding: '10px',
                borderRadius: '50px',
                width: '100%',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🚀 USE DEMO CREDENTIALS
            </button>
          )}
        </form>

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
          <span onClick={() => !isLoading && setIsRegister(!isRegister)} style={{ cursor: isLoading ? 'default' : 'pointer' }}>
            {isRegister ? 'Login now' : 'Sign up now'}
          </span>
        </p>
      </div>
    </div>
  );
}