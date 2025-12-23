import React, { useState } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Header from './components/Header';
import Footer from './components/Footer';

export default function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="*" element={<Navigate to="/" replace/>} />
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<div>About Page</div>} />
      </Routes>
      <Footer />
    </Router>
  )
}