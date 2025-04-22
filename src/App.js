import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [boards, setBoards] = useState([]);
  const [newBoardName, setNewBoardName] = useState('');
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [showAddBoard, setShowAddBoard] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/boards').then((res) => {
      setBoards(res.data);
      if (res.data.length > 0) setActiveBoardId(res.data[0].id);
    });
  }, []);

  const addBoard = () => {
    if (!newBoardName.trim()) {
      setError('Board name is required.');
      return;
    }
    axios.post('http://localhost:5000/api/boards', { name: newBoardName }).then((res) => {
      setBoards([...boards, res.data]);
      setNewBoardName('');
      setShowAddBoard(false);
      setError('');
    });
  };

  const deleteBoard = (id) => {
    if (window.confirm('Are you sure you want to delete this board?')) {
      axios.delete(`http://localhost:5000/api/boards/${id}`).then(() => {
        const updatedBoards = boards.filter((b) => b.id !== id);
        setBoards(updatedBoards);
        if (activeBoardId === id && updatedBoards.length > 0) {
          setActiveBoardId(updatedBoards[0].id);
        }
      });
    }
  };

  const addTask = (column, taskText) => {
    if (!taskText.trim()) return alert('Task cannot be empty.');
    const task = { text: taskText, status: column };
    axios.post(`http://localhost:5000/api/boards/${activeBoardId}/tasks`, task).then((res) => {
      setBoards((prevBoards) =>
        prevBoards.map((board) =>
          board.id === activeBoardId
            ? {
              ...board,
              tasks: {
                ...board.tasks,
                [column]: [...board.tasks[column], res.data],
              },
            }
            : board
        )
      );
    });
  };

  const deleteTask = (column, taskId) => {
    axios.delete(`http://localhost:5000/api/boards/${activeBoardId}/tasks/${taskId}`).then(() => {
      setBoards((prevBoards) =>
        prevBoards.map((board) =>
          board.id === activeBoardId
            ? {
              ...board,
              tasks: {
                ...board.tasks,
                [column]: board.tasks[column].filter((task) => task.id !== taskId),
              },
            }
            : board
        )
      );
    });
  };

  const activeBoard = boards.find((board) => board.id === activeBoardId);

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>Tasks</h1>
        {boards.map((board) => (
          <div
            key={board.id}
            className={`board-link ${board.id === activeBoardId ? 'active' : ''}`}
            onClick={() => setActiveBoardId(board.id)}
          >
            {board.name}
            <button onClick={() => deleteBoard(board.id)}>×</button>
          </div>
        ))}
        {showAddBoard ? (
          <div>
            <input
              type="text"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              placeholder="Board Name"
            />
            <button onClick={addBoard}>Create</button>
            <p className="error">{error}</p>
          </div>
        ) : (
          <button onClick={() => setShowAddBoard(true)}>+ Create New Board</button>
        )}
      </aside>

      <main className="board">
        {activeBoard && ['todo', 'doing', 'done'].map((column) => (
          <section key={column}>
            <h2>{column.toUpperCase()}</h2>
            <ul>
              {activeBoard.tasks[column].map((task) => (
                <li key={task.id}>
                  {task.text}
                  <button onClick={() => deleteTask(column, task.id)}>×</button>
                </li>
              ))}
            </ul>
            <TaskInput onAdd={(text) => addTask(column, text)} />
          </section>
        ))}
      </main>
    </div>
  );
}

function TaskInput({ onAdd }) {
  const [taskText, setTaskText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(taskText);
    setTaskText('');
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <input
        type="text"
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
        placeholder="New task"
      />
      <button type="submit">Add</button>
    </form>
  );
}

export default App;
