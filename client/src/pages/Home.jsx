import React, { useEffect, useState } from 'react'

export default function Home() {
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const token = localStorage.getItem('token');

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
  });

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const loadTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.search) params.append('search', filters.search);
      params.append('limit', '20');

      const res = await fetch(`${apiBaseUrl}/tasks?${params.toString()}`, {
        headers: authHeaders,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Task load failed');
        return;
      }

      setTasks(data.tasks || []);
      setError('');
    } catch (err) {
      setError('Server connect nahi ho raha');
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/tasks/stats`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (err) {
      setStats(null);
    }
  };

  useEffect(() => {
    if (token) {
      loadTasks();
      loadStats();
    }
  }, [filters.status, filters.priority]);

  const handleCreate = async (e) => {
    e.preventDefault();

    const res = await fetch(`${apiBaseUrl}/tasks`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.message || 'Task create failed');
      return;
    }

    setForm({ title: '', description: '', priority: 'Medium', dueDate: '' });
    loadTasks();
    loadStats();
  };

  const updateStatus = async (task, status) => {
    const res = await fetch(`${apiBaseUrl}/tasks/${task._id}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ status }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.message || 'Status update failed');
      return;
    }

    loadTasks();
    loadStats();
  };

  const deleteTask = async (id) => {
    await fetch(`${apiBaseUrl}/tasks/${id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    loadTasks();
    loadStats();
  };

  const searchTasks = (e) => {
    e.preventDefault();
    loadTasks();
  };

  if (!token) {
    return <div className="p-8">Pehle login karo</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Task Manager</h1>

      {error && <div className="text-red-500 mt-3">{error}</div>}

      <div className="mt-4 bg-gray-100 p-4 rounded-md">
        <h2 className="font-bold">Stats</h2>
        <p>Total: {stats?.totalTasks || 0}</p>
        <p>Done: {stats?.completedTasks || 0}</p>
        <p>Overdue: {stats?.overdueTasks || 0}</p>
        <p>High: {stats?.groupedByPriority?.High || 0} Medium: {stats?.groupedByPriority?.Medium || 0} Low: {stats?.groupedByPriority?.Low || 0}</p>
      </div>

      <form onSubmit={handleCreate} className="mt-4 bg-white p-4 rounded-md shadow">
        <h2 className="font-bold">Add Task</h2>
        <input
          className="border p-2 m-1"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <input
          className="border p-2 m-1"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <select
          className="border p-2 m-1"
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value })}
        >
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <input
          className="border p-2 m-1"
          type="date"
          value={form.dueDate}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          required
        />
        <button className="bg-blue-500 text-white p-2 rounded-md">Add</button>
      </form>

      <form onSubmit={searchTasks} className="mt-4">
        <input
          className="border p-2 m-1"
          placeholder="Search title"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          className="border p-2 m-1"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option>Todo</option>
          <option>In Progress</option>
          <option>Done</option>
          <option>Overdue</option>
        </select>
        <select
          className="border p-2 m-1"
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
        >
          <option value="">All Priority</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <button className="bg-gray-700 text-white p-2 rounded-md">Search</button>
      </form>

      <div className="mt-4">
        {tasks.map((task) => (
          <div
            key={task._id}
            className={`border p-3 mt-2 rounded-md ${task.computedStatus === 'Overdue' ? 'bg-red-100 border-red-500' : 'bg-white'}`}
          >
            <h3 className="font-bold">{task.title}</h3>
            <p>{task.description}</p>
            <p>Status: {task.computedStatus}</p>
            <p>Priority: {task.priority}</p>
            <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>

            <select
              className="border p-2 m-1"
              value={task.status}
              onChange={(e) => updateStatus(task, e.target.value)}
            >
              <option>Todo</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>
            <button
              onClick={() => deleteTask(task._id)}
              className="bg-red-500 text-white p-2 rounded-md"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
