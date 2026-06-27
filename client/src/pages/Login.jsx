import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                // localStorage me token store karein
                localStorage.setItem('token', data.token);
                alert('Login Successful!');
                navigate('/home'); 
            } else {
                setError(data.message || 'Something went wrong');
            }
        } catch (err) {
            setError('Failed to connect to the server');
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <h1>Welcome Back</h1>
            <p className="text-gray-600">Please enter your details to sign in</p>

            {error && <div className="text-red-500">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="bg-gray-100 p-4 rounded-md">
                    <label className="block text-gray-700">Email Address</label>
                    <input
                        type="email"
                        placeholder="hello@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="bg-gray-100 p-4 rounded-md">
                    <label className="block text-gray-700">Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">
                    Sign In
                </button>
            </form>

            <div className="text-center mt-4">
                Don't have an account?
                <Link to="/signup" className="text-blue-500 hover:underline">
                    Sign Up
                    </Link>
            </div>
        </div>
    );
}

export default Login;