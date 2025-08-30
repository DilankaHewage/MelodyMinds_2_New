import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css';
import UserDashboard from './UserDashboard';
import AdvertiserDashboard from './AdvertiserDashboard';

const USERS_PER_PAGE = 10;

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editUserId, setEditUserId] = useState(null);
  const [editUserData, setEditUserData] = useState({ name: '', email: '', role: '' });
  const [analytics, setAnalytics] = useState({ totalUsers: 0, activeUsers: 0, totalAdvertisers: 0, topAdvertiser: null });
  const [activeSection, setActiveSection] = useState('user-management');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('userToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get('http://localhost:5000/api/users/', config);
      setUsers(data);
      // Analytics calculation
      const totalUsers = data.length;
      const totalAdvertisers = data.filter(u => u.role === 'advertiser').length;
      // active users = users updated in last 30 days
      const now = new Date();
      const activeUsers = data.filter(u => u.updatedAt && (now - new Date(u.updatedAt)) < 30 * 24 * 60 * 60 * 1000).length;
      // Highly engaged advertiser: advertiser with most recent update
      const advertisers = data.filter(u => u.role === 'advertiser');
      let topAdvertiser = null;
      if (advertisers.length > 0) {
        topAdvertiser = advertisers.reduce((a, b) => new Date(a.updatedAt) > new Date(b.updatedAt) ? a : b);
      }
      setAnalytics({ totalUsers, activeUsers, totalAdvertisers, topAdvertiser });
    } catch (err) {
      setError('Failed to fetch users');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(users.length / USERS_PER_PAGE);
  const paginatedUsers = users.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('userToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:5000/api/users/${id}`, config);
      setUsers(users.filter((u) => u._id !== id));
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const handleEdit = (user) => {
    setEditUserId(user._id);
    setEditUserData({ name: user.name, email: user.email, role: user.role });
  };

  const handleEditChange = (e) => {
    setEditUserData({ ...editUserData, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`http://localhost:5000/api/users/${editUserId}`, editUserData, config);
      setEditUserId(null);
      fetchUsers();
    } catch (err) {
      setError('Failed to update user');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <ul>
          <li className={activeSection === 'user-management' ? 'active' : ''} onClick={() => setActiveSection('user-management')}>User Management</li>
          <li className={activeSection === 'user-dashboard' ? 'active' : ''} onClick={() => setActiveSection('user-dashboard')}>User Dashboard</li>
              </ul>
      </aside>
      <main className="admin-main">
        {activeSection === 'user-management' && (
          <div className="user-management-section">
            <h2>User Management</h2>
            <div className="analytics-cards">
              <div className="analytics-card">
                <h3>Total Users</h3>
                <p>{analytics.totalUsers}</p>
              </div>
              <div className="analytics-card">
                <h3>Active Users</h3>
                <p>{analytics.activeUsers}</p>
              </div>
              <div className="analytics-card">
                <h3>Total Advertisers</h3>
                <p>{analytics.totalAdvertisers}</p>
              </div>
              <div className="analytics-card">
                <h3>Top Advertiser</h3>
                <p>{analytics.topAdvertiser ? analytics.topAdvertiser.name : 'N/A'}</p>
              </div>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            {loading ? (
              <p>Loading users...</p>
            ) : (
              <>
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr key={user._id}>
                      <td>
                        {editUserId === user._id ? (
                          <input
                            type="text"
                            name="name"
                            value={editUserData.name}
                            onChange={handleEditChange}
                          />
                        ) : (
                          user.name
                        )}
                      </td>
                      <td>
                        {editUserId === user._id ? (
                          <input
                            type="email"
                            name="email"
                            value={editUserData.email}
                            onChange={handleEditChange}
                          />
                        ) : (
                          user.email
                        )}
                      </td>
                      <td>
                        {editUserId === user._id ? (
                          <select name="role" value={editUserData.role} onChange={handleEditChange}>
                            <option value="user">User</option>
                            <option value="advertiser">Advertiser</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          user.role
                        )}
                      </td>
                      <td>
                        {editUserId === user._id ? (
                          <>
                            <button onClick={handleEditSave}>Save</button>
                            <button onClick={() => setEditUserId(null)}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEdit(user)}>Edit</button>
                            
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
              </div>
              </>
            )}
          </div>
        )}
        {activeSection === 'user-dashboard' && (
          <div className="admin-embed-dashboard"><UserDashboard /></div>
        )}
        {activeSection === 'advertiser-dashboard' && (
          <div className="admin-embed-dashboard"><AdvertiserDashboard /></div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard; 