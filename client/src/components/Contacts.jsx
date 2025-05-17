import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Contacts.css';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view contacts');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:5001/api/contacts', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setContacts(response.data.data);
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || 'Error fetching contacts');
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  if (loading) {
    return <div className="loading">Loading contacts...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (contacts.length === 0) {
    return (
      <div className="no-contacts">
        <h2>No Contacts Found</h2>
        <p>Upload a CSV file to add contacts.</p>
      </div>
    );
  }

  return (
    <div className="contacts">
      <h2>Contacts ({contacts.length})</h2>
      <div className="contacts-grid">
        {contacts.map((contact) => (
          <div key={contact._id} className="contact-card">
            <div className="contact-header">
              <h3>{contact.name}</h3>
              <span className={`status ${contact.status}`}>
                {contact.status}
              </span>
            </div>
            <div className="contact-details">
              <p><strong>Email:</strong> {contact.email}</p>
              <p><strong>Phone:</strong> {contact.phone}</p>
              {contact.notes && (
                <p><strong>Notes:</strong> {contact.notes}</p>
              )}
              <p className="date-added">
                Added: {new Date(contact.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Contacts; 