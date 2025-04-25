// app/send-birthday-wishes/page.js
'use client';

import { useState } from 'react';

export default function SendBirthdayWishes() {
  const [fileName, setFileName] = useState('No file chosen');
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName('No file chosen');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const res = await fetch('/api/request', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Network response was not ok');
      
      const result = await res.json();
      if (result?.message) {
        setSuccessMessage(true);
        setErrorMessage(false);
        e.target.reset();
        setFileName('No file chosen');

        setTimeout(() => {
          setSuccessMessage(false);
        }, 5000);
      } else {
        throw new Error('Invalid response');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setErrorMessage(true);
      setSuccessMessage(false);

      setTimeout(() => {
        setErrorMessage(false);
      }, 5000);
    }
  };

  return (
    <div>
      <div className="header">
        <h1>Send Birthday Wishes</h1>
        <p className="subtitle">Share your special message and a photo to celebrate this special day!</p>
      </div>

      <div className="form-container">
        {successMessage && (
          <div className="success-message">
            Your birthday wish has been sent successfully! Thank you for your contribution.
          </div>
        )}
        
        {errorMessage && (
          <div className="error-message">
            There was a problem sending your message. Please try again.
          </div>
        )}

        <form id="birthdayForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Your Name</label>
            <input type="text" id="name" name="name" required />
          </div>

          <div className="form-group">
            <label htmlFor="message">Birthday Message</label>
            <textarea
              id="message"
              name="message"
              required
              placeholder="Write your birthday wishes here..."
            ></textarea>
          </div>

          <div className="form-group">
            <label>Upload an Image</label>
            <div className="file-input-container">
              <div className="file-input-button">Choose Image</div>
              <input
                type="file"
                accept="image/*"
                id="imageUpload"
                name="image"
                className="file-input"
                onChange={handleFileChange}
              />
            </div>
            <div className="file-name">{fileName}</div>
          </div>

          <button type="submit" className="submit-btn">Send Birthday Wish</button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <a href="index.html" className="view-wishes-link">View All Birthday Wishes</a>
        </div>
      </div>

      <style jsx>{`
        /* Your CSS styles here */
      `}</style>
    </div>
  );
}
