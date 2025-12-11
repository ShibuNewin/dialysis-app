import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from './api';
import { useAuth } from './context/AuthContext';

export default function UserDashboard() {
  const [shifts, setShifts] = useState<any[]>([]);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    axios.get(`${API_URL}/shifts`).then(res => setShifts(res.data));
  }, []);

  return (
    <div className="dashboard-container">
      {/* HEADER CARD */}
      <div className="header-card">
        <div>
           <h1 style={{margin: 0, fontSize: '24px', color: '#2a5298'}}>Welcome back, {user?.name}</h1>
           <p style={{margin: '5px 0 0 0', color: '#636e72'}}>Patient ID: {user?.patient_id} • Room {user?.room_number}</p>
        </div>
        <button onClick={logout} className="btn-outline" style={{borderColor: '#ff5e62', color: '#ff5e62'}}>Logout</button>
      </div>

      <h3 className="section-title">Select a Shift</h3>

      {/* RICH SHIFT GRID */}
      <div className="card-grid">
        {shifts.map(s => (
          <div key={s.id} className="shift-card">
             <div style={{display: 'flex', alignItems: 'center', marginBottom: '15px'}}>
                <div style={{fontSize: '35px', marginRight: '15px', background: '#e3f2fd', padding: '10px', borderRadius: '50%'}}>⏰</div>
                <div>
                   <h4 style={{margin: 0, fontSize: '18px', color: '#333'}}>{s.start_time}</h4>
                   <span style={{fontSize: '13px', color: '#10b981', fontWeight: 600}}>● Open for Booking</span>
                </div>
             </div>
             <button onClick={() => navigate(`/booking/${s.id}`)} className="btn-gradient" style={{fontSize: '14px', padding: '12px'}}>
               Check Availability →
             </button>
          </div>
        ))}
      </div>
    </div>
  );
}