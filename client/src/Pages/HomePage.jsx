import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';

function HomePage() {
  const navigate = useNavigate();
  const [boardId, setBoardId] = useState('');

  const handleCreateBoard = () => {
    const newBoardId = nanoid(8);
    navigate(`/board/${newBoardId}`);
  };

  const handleJoinBoard = (e) => {
    e.preventDefault();
    if (boardId.trim()) {
      navigate(`/board/${boardId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Whiteboard
            </h1>
            <p className="text-gray-600">
              Collaborate in real-time with your team
            </p>
          </div>

          <button
            onClick={handleCreateBoard}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 mb-4"
          >
            Create New Board
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <form onSubmit={handleJoinBoard}>
            <div className="mb-4">
              <label 
                htmlFor="boardId" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Join existing board
              </label>
              <input
                type="text"
                id="boardId"
                value={boardId}
                onChange={(e) => setBoardId(e.target.value)}
                placeholder="Enter board ID"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200"
            >
              Join Board
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-sm mt-6">
          @ 2024 Collaborative Whiteboard. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default HomePage;