import React from 'react';

const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
        <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
        ></path>
        <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v8.51h12.8c-.57 3.02-2.31 5.45-4.92 7.18l7.98 6.19c4.63-4.28 7.34-10.42 7.34-17.33z"
        ></path>
        <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
        ></path>
        <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.98-6.19c-2.11 1.45-4.82 2.3-7.91 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
        ></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
);
export const LoginPage = ({ onSignIn }) => (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-indigo-100 p-4">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Expense Tracker</h1>
        </div>
        <div className="bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-sm text-center w-full max-w-sm">
            <p className="mb-6 text-slate-600">Please sign in to manage your expenses.</p>
            <button
                onClick={onSignIn}
                className="flex items-center justify-center gap-3 w-full px-6 py-3 bg-blue-600 border border-transparent rounded-xl shadow-sm text-white font-semibold hover:bg-blue-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105"
            >
                <GoogleIcon />
                Sign in with Google
            </button>
        </div>
    </div>
);
