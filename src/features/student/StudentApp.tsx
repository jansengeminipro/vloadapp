import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import WorkoutRunner from './pages/WorkoutRunner';

const StudentApp: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<StudentDashboard />} />
                <Route path="/profile" element={<StudentProfile />} />
                <Route path="/workout/:templateId" element={<WorkoutRunner />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

export default StudentApp;
