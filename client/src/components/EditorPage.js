import React, { useEffect, useRef, useState } from 'react';
import Client from './Client'; // Import Client component
import Editor from './Editor'; // Import Editor component
import { initSocket } from '../Socket'; // Import socket initialization function
import { useLocation, useParams, useNavigate, Navigate } from 'react-router-dom'; // Import hooks from react-router-dom
import { ACTIONS } from "../Actions"; // Import action constants
import { toast } from "react-hot-toast"; // Import toast notification

function EditorPage() {
  const [clients, setClients] = useState([]); // State for clients in the room
  const codeRef = useRef(null); // Ref for storing code changes

  const location = useLocation(); // Get current location
  const navigate = useNavigate(); // Navigate function
  const { roomId } = useParams(); // Get room ID from URL parameters

  const socketRef = useRef(null); // Ref for socket connection

  useEffect(() => {
    const handleErrors = (err) => { // Function to handle socket connection errors
      console.log("Error", err);
      toast.error("Socket connection failed, Try again later");
      navigate("/"); // Navigate to home on error
    };

    const init = async () => { // Initialize socket connection
      socketRef.current = await initSocket(); // Initialize socket
      socketRef.current.on("connect_error", handleErrors); // Handle connection errors
      socketRef.current.on("connect_failed", handleErrors); // Handle connection failures

      socketRef.current.emit(ACTIONS.JOIN, { // Emit join room action
        roomId,
        username: location.state?.username,
      });

      socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => { // Handle user joining room
        if (username !== location.state?.username) {
          toast.success(`${username} joined the room.`); // Notify user of join event
        }
        setClients(clients); // Update client list
        socketRef.current.emit(ACTIONS.SYNC_CODE, { // Sync code with new user
          code: codeRef.current,
          socketId,
        });
      });

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => { // Handle user disconnection
        toast.success(`${username} left the room`); // Notify user of leave event
        setClients((prev) => prev.filter((client) => client.socketId !== socketId)); // Remove client from list
      });
    };

    init(); // Initialize socket connection

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect(); // Disconnect socket on unmount
        socketRef.current.off(ACTIONS.JOINED); // Remove event listeners
        socketRef.current.off(ACTIONS.DISCONNECTED); // Remove event listeners
      }
    };
  }, [location.state?.username, navigate, roomId]); // Dependencies for useEffect

  if (!location.state) {
    return <Navigate to="/" />; // Redirect if username is not provided
  }

  const copyRoomId = async () => { // Function to copy room ID to clipboard
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success(`Room ID copied`); // Notify user of successful copy
    } catch (error) {
      console.log(error);
      toast.error("Unable to copy the Room ID"); // Notify user of copy failure
    }
  };

  const leaveRoom = () => {
    navigate("/"); // Navigate to home on leave room
  };

  return (
    <div className="container-fluid vh-100">
      <div className="row vh-100">
        <div className="col-md-2 bg-gradient text-light d-flex flex-column h-100" style={{ backgroundColor: 'rgba(30, 0, 0, 1)', boxShadow: '10px 0px 10px rgba(30, 0, 0, 1)' }}>
          <img className="img-fluid mx-auto" src="/images/logo-no-background.png" alt="codyssey" style={{ maxWidth: "100px", marginTop: '15px' }} />
          <hr style={{ marginTop: '15px' }} />

          <div className="d-flex flex-column overflow-auto">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} /> // Render Client component for each client
            ))}
          </div>

          <div className="mt-auto d-flex justify-content-center align-items-center flex-column">
            <hr style={{ width: '100%', color: '#fff', backgroundColor: '#fff', borderColor: '#fff' }} />
            <button onClick={copyRoomId} className="container btn btn-success">Copy Room ID</button> {/* Button to copy room ID */}
            <button onClick={leaveRoom} className="container btn btn-danger mt-2 mb-2 px-3 btn-block">Leave Room</button> {/* Button to leave room */}
          </div>
        </div>

        <div className="col-md-10 text-light d-flex flex-column" style={{ backgroundColor: 'rgba(20, 0, 0, 1)', height: '100vh' }}>
          <Editor socketRef={socketRef} roomId={roomId} onCodeChange={(code) => { codeRef.current = code }} /> {/* Render Editor component */}
        </div>
      </div>
    </div>
  );
}

export default EditorPage; // Export EditorPage component as default
