import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { EmotionDemo } from './components/EmotionDemo/EmotionDemo';
// ... existing imports ...

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* ... existing routes ... */}
        <Route path="/emotion-demo" element={<EmotionDemo />} />
      </Routes>
    </Router>
  );
}; 