import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaTachometerAlt, FaMoneyBillWave, FaWallet, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = () => {
  const { logout, user } = useAuth();

  return (
    <div className="sidebar">
      <h3>
        <FaWallet style={{ marginRight: '8px', verticalAlign: 'middle' }} />
        Expense Tracker
      </h3>
      <nav>
        <NavLink to="/" end>
          <FaTachometerAlt /> Dashboard
        </NavLink>
        <NavLink to="/income">
          <FaMoneyBillWave /> Income
        </NavLink>
        <NavLink to="/expenses">
          <FaWallet /> Expenses
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <span>{user?.name}</span>
        <button onClick={logout}>
          <FaSignOutAlt style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
