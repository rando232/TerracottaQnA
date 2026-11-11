import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Directory from './pages/Directory';
import QuestionDetail from './pages/QuestionDetail';
import Search from './pages/Search';
import AskQuestion from './pages/AskQuestion';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Database from './pages/Database';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/questions/:id" element={<QuestionDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/ask" element={<AskQuestion />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/users/:username" element={<Profile />} />
            <Route path="/database" element={<Database />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Terracotta QnA</h3>
                  <p className="text-sm text-gray-600">
                    A community-driven platform for Information Retrieval and Search Engineering discussions.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Features</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• BM25 Search Ranking</li>
                    <li>• Spell Correction</li>
                    <li>• Query-focused Snippets</li>
                    <li>• Community Voting</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li><a href="/" className="hover:text-primary-600">Home</a></li>
                    <li><a href="/directory" className="hover:text-primary-600">Directory</a></li>
                    <li><a href="/search" className="hover:text-primary-600">Search</a></li>
                    <li><a href="/ask" className="hover:text-primary-600">Ask Question</a></li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} Terracotta QnA. Built with React & FastAPI.</p>
              </div>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
