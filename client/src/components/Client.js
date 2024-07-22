import React from 'react';
import Avatar from 'react-avatar'; // Import Avatar component for displaying user avatars

function Client({ username }) {
  return (
    <div className="d-flex align-items-center mb-3">
      <Avatar name={username.toString()} size={50} round="14px" className="mr-3" /> {/* Avatar component with username as name */}
      <span className='mx-2'>{username.toString()}</span> {/* Display username */}
    </div>
  );
}

export default Client;
