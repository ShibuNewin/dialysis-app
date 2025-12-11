import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [newShift, setNewShift] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/shifts').then(res => setShifts(res.data));
  }, []);

  const createShift = async () => {
    await axios.post('http://localhost:5000/admin/shifts', {
      center_id: 1, // Hardcoded for demo
      start_time: newShift,
      date: new Date().toISOString()
    });
    alert('Shift Created!');
    window.location.reload();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Dashboard</h1>
      <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '20px' }}>
        <h3>Create New Shift</h3>
        <input 
            placeholder="Shift Name (e.g. Night Shift)" 
            value={newShift} 
            onChange={e => setNewShift(e.target.value)} 
        />
        <button onClick={createShift} style={{ marginLeft: '10px' }}>Create</button>
      </div>
      
      <h3>Existing Shifts</h3>
      <ul>
        {shifts.map(s => <li key={s.id}>{s.start_time}</li>)}
      </ul>
    </div>
  );
}