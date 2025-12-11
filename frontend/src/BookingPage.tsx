import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './context/AuthContext';
import { API_URL } from './api'; // <--- IMPORT ADDED FOR DEPLOYMENT

export default function BookingPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [slots, setSlots] = useState<any[]>([]);
  const [tier, setTier] = useState('STANDARD');
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    // UPDATED: Using API_URL
    axios.get(`${API_URL}/slots?shiftId=${id}&tier=${tier}`)
         .then(res => setSlots(res.data));
  }, [id, tier, loading]);

  const availableCount = slots.filter(s => s.status === 'AVAILABLE').length;

  const handleBook = async (slot: any) => {
    // 1. Withdraw Logic
    if (slot.status === 'BOOKED' && slot.booked_by_user_id === user?.id) {
       if(!window.confirm("Are you sure you want to withdraw/cancel this booking?")) return;
       try {
         // UPDATED: Using API_URL
         await axios.post(`${API_URL}/withdraw`, { slotId: slot.id, userId: user?.id });
         setLoading(!loading);
       } catch(e) { alert("Error withdrawing"); }
       return;
    }

    if (slot.status === 'BOOKED') return;

    // 2. Booking Logic
    try {
      if(tier === 'PREMIUM') {
         if(!window.confirm(`💎 Premium Ward: Confirm payment of ₹${slot.price}?`)) return;
         setProcessingPayment(true);
         setTimeout(async () => {
            // UPDATED: Using API_URL
            await axios.post(`${API_URL}/book`, { slotId: slot.id, userId: user?.id, paymentStatus: 'PAID' });
            setProcessingPayment(false);
            setLoading(!loading);
            alert("✅ Payment Successful! Bed Confirmed.");
         }, 2500);
      } else {
         // UPDATED: Using API_URL
         await axios.post(`${API_URL}/book`, { slotId: slot.id, userId: user?.id, paymentStatus: 'COMPLETED' });
         setLoading(!loading);
      }
    } catch (e) { 
        setProcessingPayment(false);
        alert('Booking Failed'); 
    }
  };

  if (processingPayment) return (
    <div style={{height:'100vh', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', background:'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', color:'white'}}>
        <div style={{fontSize:'50px', marginBottom:'20px'}}>🏦</div>
        <h1>Contacting Bank...</h1>
        <div style={{marginTop:'20px', width:'50px', height:'50px', border:'5px solid white', borderTop:'5px solid transparent', borderRadius:'50%', animation:'spin 1s linear infinite'}}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div className="dashboard-container">
      {/* HEADER WITH COUNT */}
      <div style={{marginBottom: '30px', background:'white', padding:'20px', borderRadius:'15px', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 4px 10px rgba(0,0,0,0.05)'}}>
        <div>
            <button onClick={() => navigate('/')} style={{background:'none', border:'none', color:'#666', cursor:'pointer', fontSize:'16px', marginBottom:'5px'}}>← Back to Shifts</button>
            <h1 style={{color: '#2d3436', margin: 0}}>Shift #{id} Availability</h1>
            <p style={{margin:'5px 0 0 0', color: availableCount > 0 ? '#10b981' : '#ef4444', fontWeight:'bold'}}>
                ✅ {availableCount} Beds Available
            </p>
        </div>
        <div style={{textAlign:'right'}}>
            <div style={{fontWeight:'bold', fontSize:'18px'}}>{user?.name}</div>
            <div style={{fontSize:'14px', color:'#888'}}>Patient ID: {user?.patient_id}</div>
        </div>
      </div>

      <div className="tab-container">
         <button className={`tab-btn ${tier === 'STANDARD' ? 'active' : ''}`} onClick={() => setTier('STANDARD')}>Standard Ward</button>
         <button className={`tab-btn premium ${tier === 'PREMIUM' ? 'active' : ''}`} onClick={() => setTier('PREMIUM')}>💎 Premium Ward</button>
      </div>

      {/* RICH BED GRID */}
      <div className="bed-container">
        {slots.map(slot => {
            const isMine = slot.booked_by_user_id === user?.id;
            const isBooked = slot.status !== 'AVAILABLE';
            
            // Dynamic Styles
            let cardStyle: any = { borderLeft: '5px solid #10b981' }; // Green line for available
            let statusText = "AVAILABLE";
            let statusColor = "#10b981"; 

            if (isMine) {
                cardStyle = { background: '#d1fae5', borderLeft: '5px solid #065f46' }; 
                statusText = "YOUR BOOKING";
                statusColor = "#065f46";
            } else if (isBooked) {
                cardStyle = { background: '#f9fafb', opacity: 0.7, borderLeft: '5px solid #ef4444' };
                statusText = "OCCUPIED";
                statusColor = "#ef4444";
            }

            return (
               <div key={slot.id} className="bed-item" style={cardStyle}>
                  <div className="bed-icon">🛏️</div>
                  
                  <div>
                    <div style={{fontSize:'22px', fontWeight:'700', color:'#333'}}>Bed {slot.machine_number}</div>
                    <div style={{color:'#666', fontSize:'14px'}}>{slot.type}</div>
                    <div style={{color: tier==='PREMIUM'?'#f59e0b':'#666', fontWeight:'bold', marginTop:'5px'}}>
                        {tier === 'PREMIUM' ? `₹${slot.price}` : 'Free'}
                    </div>
                  </div>

                  <div style={{borderTop:'1px solid #eee', paddingTop:'15px', marginTop:'15px'}}>
                      <div style={{fontSize:'12px', fontWeight:'800', color:statusColor, marginBottom:'10px'}}>
                          {statusText}
                      </div>

                      {/* ACTION BUTTONS */}
                      {!isBooked && (
                          <button 
                            onClick={() => handleBook(slot)}
                            className="btn-gradient"
                            style={{fontSize: '13px', padding: '10px', width:'100%', borderRadius:'8px', marginTop:0}}
                          >
                            BOOK NOW
                          </button>
                      )}

                      {isMine && (
                          <button 
                            onClick={() => handleBook(slot)}
                            style={{width:'100%', padding:'10px', background:'#ef4444', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}
                          >
                              WITHDRAW
                          </button>
                      )}
                  </div>
               </div>
            )
        })}
      </div>
    </div>
  );
}