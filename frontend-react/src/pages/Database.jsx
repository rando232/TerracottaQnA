import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TableCellsIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Database = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [databaseData, setDatabaseData] = useState(null);
  const [expandedTables, setExpandedTables] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Check if user is admin
    if (user && user.role !== 'super_admin') {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }

    loadDatabaseData();
  }, [isAuthenticated, user, navigate]);

  const loadDatabaseData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/admin/database', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setDatabaseData(response.data);
    } catch (error) {
      console.error('Failed to load database:', error);
      setError(error.response?.data?.detail || 'Failed to load database data');
    } finally {
      setLoading(false);
    }
  };

  const toggleTable = (tableName) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };

  const downloadJSON = () => {
    const dataStr = JSON.stringify(databaseData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `terracotta_database_${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Viewer</h1>
              <p className="text-gray-600">View all database tables and their contents</p>
            </div>
            <button
              onClick={downloadJSON}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Download JSON
            </button>
          </div>
        </div>

        {/* Tables */}
        {databaseData && (
          <div className="space-y-4">
            {Object.entries(databaseData).map(([tableName, tableData]) => (
              <div key={tableName} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Table Header */}
                <button
                  onClick={() => toggleTable(tableName)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {expandedTables[tableName] ? (
                      <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRightIcon className="w-5 h-5 text-gray-500" />
                    )}
                    <TableCellsIcon className="w-6 h-6 text-primary-600" />
                    <span className="text-lg font-semibold text-gray-900">{tableName}</span>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    {tableData.count} rows
                  </span>
                </button>

                {/* Table Content */}
                {expandedTables[tableName] && (
                  <div className="border-t border-gray-200">
                    {tableData.error ? (
                      <div className="px-6 py-4 text-red-600">
                        Error: {tableData.error}
                      </div>
                    ) : tableData.rows && tableData.rows.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {Object.keys(tableData.rows[0]).map((column) => (
                                <th
                                  key={column}
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  {column}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {tableData.rows.map((row, rowIndex) => (
                              <tr key={rowIndex} className="hover:bg-gray-50">
                                {Object.values(row).map((value, colIndex) => (
                                  <td
                                    key={colIndex}
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                  >
                                    {value === null ? (
                                      <span className="text-gray-400 italic">null</span>
                                    ) : typeof value === 'object' ? (
                                      <span className="text-gray-600 font-mono text-xs">
                                        {JSON.stringify(value)}
                                      </span>
                                    ) : (
                                      String(value)
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="px-6 py-4 text-gray-500 text-center">
                        No data in this table
                      </div>
                    )}

                    {/* JSON View */}
                    <details className="border-t border-gray-200">
                      <summary className="px-6 py-3 bg-gray-50 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-100">
                        View as JSON
                      </summary>
                      <pre className="px-6 py-4 bg-gray-900 text-green-400 overflow-x-auto text-xs font-mono">
                        {JSON.stringify(tableData.rows, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Database;
