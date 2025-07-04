import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* ROTA PROTEGIDA */}
            <Route 
                path="/chat" 
                element={
                    <ProtectedRoute>
                        <ChatPage />
                    </ProtectedRoute>
                } 
            />
        </Routes>
    );
}