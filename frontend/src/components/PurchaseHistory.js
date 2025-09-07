import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PurchaseHistory.css';

const PurchaseHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPurchaseHistory();
  }, []);

  const fetchPurchaseHistory = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.get('http://localhost:5000/api/transactions/purchase-history', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTransactions(response.data.data);
    } catch (error) {
      console.error('Error fetching purchase history:', error);
      setError('Failed to load purchase history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  if (loading) {
    return (
      <div className="purchase-history-container">
        <div className="loading">Loading purchase history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="purchase-history-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="purchase-history-container">
      <h2>Purchase History</h2>
      
      {transactions.length === 0 ? (
        <div className="no-purchases">
          <p>You haven't made any purchases yet.</p>
        </div>
      ) : (
        <div className="transactions-list">
          {transactions.map((transaction) => (
            <div key={transaction._id} className="transaction-card">
              <div className="transaction-header">
                <h3>{transaction.event.title}</h3>
                <span className="receipt-id">Receipt: {transaction.receiptId}</span>
              </div>
              
              <div className="transaction-details">
                <div className="event-info">
                  <p><strong>Date:</strong> {formatDate(transaction.event.date)}</p>
                  <p><strong>Time:</strong> {formatTime(transaction.event.time)}</p>
                  <p><strong>Venue:</strong> {transaction.event.venue}</p>
                  <p><strong>District:</strong> {transaction.event.district}</p>
                </div>
                
                <div className="purchase-info">
                  <p><strong>Tickets:</strong> {transaction.numberOfTickets}</p>
                  <p><strong>Total:</strong> {transaction.currency} {transaction.totalAmount}</p>
                  <p><strong>Purchase Date:</strong> {formatDate(transaction.createdAt)}</p>
                </div>
              </div>
              
              {transaction.event.poster && (
                <div className="event-poster">
                  <img src={transaction.event.poster} alt={transaction.event.title} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory;