import React, { useState } from 'react';
import toast from 'react-hot-toast'; // Toast notifications
import { v4 as uuid } from 'uuid'; // UUID generation
import { useNavigate } from 'react-router-dom'; // Navigation

function Home() {
  const [roomId, setRoomId] = useState(""); // State for room ID
  const [username, setUsername] = useState(""); // State for username
  const navigate = useNavigate(); // Navigation hook

  // Generate a new Room ID
  const generateRoomId = (e) => {
    e.preventDefault();
    const id = uuid();
    setRoomId(id);
    toast.success("Room ID is generated");
  };

  // Join room function
  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error('Both fields are required');
      return;
    }
    navigate(`/editor/${roomId}`, { state: { username } });
    toast.success("Room is created");
  };

  // Handle Enter key press in input fields
  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  // JSX structure
  return (
    <div className="container-fluid">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-12 col-md-6">
          <div className="card shadow-sm p-3 mb-5 rounded" style={{ backgroundColor: 'rgba(141, 3, 3, 0.1)', border: '2px solid #5E0101' }}>
            <div className="card-body text-center text-light" style={{ backgroundColor: 'rgba(94, 1, 1, 0)' }}>
              <img className="img-fluid mx-auto d-block mb-3" src="/images/logo-no-background.png" alt="codyssey" style={{ maxWidth: "150px" }} />
              <h6>Enter the Room ID</h6>
              <div className='form-grp'>
                <input onKeyUp={handleInputEnter} value={roomId} onChange={(e) => setRoomId(e.target.value)} type='text' className='form-control mb-2' placeholder='Room ID' style={{ backgroundColor: "#d5f3eb", color: "#000" }} />
                <input onKeyUp={handleInputEnter} value={username} onChange={(e) => setUsername(e.target.value)} type='text' className='form-control mb-2' placeholder='USERNAME' style={{ backgroundColor: "#d5f3eb", color: "#000" }} />
              </div>
              <button onClick={joinRoom} className='btn btn-outline-info btn-lg btn-block'>JOIN</button>
              <p className='mt-2 text-light'>
                Don't have a Room ID? Create{" "}
                <span className='text-info p-2' style={{ cursor: 'pointer' }} onClick={generateRoomId}>
                  New Room
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
