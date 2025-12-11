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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isRegister ? '/register' : '/login';
    try {
      const res = await axios.post(`${API_URL}${endpoint}`, formData);
      login(res.data);
      if (res.data.email.includes('admin')) navigate('/admin'); 
      else navigate('/'); 
    } catch (err) { alert('Authentication Failed'); }
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
          
          <button type="submit" className="btn-gradient">
            {isRegister ? 'SIGN UP' : 'LOG IN'}
          </button>
        </form>

        <p className="link-text">
          {isRegister ? 'Already a member?' : 'Not a member?'} 
          <span onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Login now' : 'Sign up now'}
          </span>
        </p>
      </div>
    </div>
  );
}