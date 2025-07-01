import React, { useState } from 'react';

const MailIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
        <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
    </svg>
);

const LockClosedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
    </svg>
);

const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-5.5-2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10 12a5.5 5.5 0 0 0-5.447 3.367a.75.75 0 0 0 1.396.634A4.002 4.002 0 0 1 10 14a4 4 0 0 1 4.053 2.001a.75.75 0 0 0 1.396-.634A5.5 5.5 0 0 0 10 12Z" clipRule="evenodd" />
    </svg>
);


interface AuthFormProps {
  onLogin: (email: string, pass: string) => Promise<{ success: boolean, error?: string }>;
  onRegister: (email: string, pass:string, name: string) => Promise<{ success: boolean, error?: string }>;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLogin, onRegister }) => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const result = isLoginMode
            ? await onLogin(email, password)
            : await onRegister(email, password, displayName);
        
        if (!result.success && result.error) {
            setError(result.error);
        }
        setIsLoading(false);
    };
    
    const toggleMode = () => {
        setIsLoginMode(!isLoginMode);
        setError(null);
        setEmail('');
        setPassword('');
        setDisplayName('');
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-3xl font-bold text-center text-primary mb-2">
                {isLoginMode ? 'Welcome Back!' : 'Create Account'}
            </h2>
            <p className="text-center text-slate-500 mb-8">
                {isLoginMode ? 'Sign in to access your dashboard' : 'Sign up to start tracking your net worth'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                {!isLoginMode && (
                    <div>
                        <label htmlFor="displayName" className="sr-only">Display Name</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <UserIcon className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                id="displayName"
                                name="displayName"
                                type="text"
                                required
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="block w-full rounded-md border-0 py-3 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
                                placeholder="Display Name"
                            />
                        </div>
                    </div>
                )}
                <div>
                    <label htmlFor="email" className="sr-only">Email address</label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <MailIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full rounded-md border-0 py-3 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
                            placeholder="Email address"
                        />
                    </div>
                </div>

                <div>
                     <label htmlFor="password"  className="sr-only">Password</label>
                    <div className="relative">
                       <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <LockClosedIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete={isLoginMode ? "current-password" : "new-password"}
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full rounded-md border-0 py-3 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
                            placeholder="Password"
                        />
                    </div>
                </div>
                
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3" role="alert">
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex w-full justify-center rounded-md bg-primary px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
                    >
                        {isLoading ? 'Processing...' : (isLoginMode ? 'Sign in' : 'Sign up')}
                    </button>
                </div>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
                {isLoginMode ? "Don't have an account?" : "Already have an account?"}
                <button onClick={toggleMode} className="font-semibold leading-6 text-primary hover:text-primary-hover ml-1">
                    {isLoginMode ? 'Sign up' : 'Sign in'}
                </button>
            </p>
        </div>
    );
};

export default AuthForm;
