import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Image } from '../components/ImageWithFallback';

const Login = () => {
    const { loginWithGoogle, currentUser } = useAuth();
    const navigate = useNavigate();

    // If already logged in, redirect to home
    React.useEffect(() => {
        if (currentUser) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    return (
        <div className="content-padding" style={{
            display:'flex', 
            alignItems:'center', 
            justifyContent:'center', 
            minHeight:'80vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            margin:'-20px',
            borderRadius:'20px'
        }}>
            <div style={{
                background:'rgba(0,0,0,0.6)',
                padding:'60px 40px',
                borderRadius:'20px',
                textAlign:'center',
                maxWidth:'400px',
                width:'100%',
                backdropFilter:'blur(10px)'
            }}>
                <Image src="/assets/images/Musify.svg" alt="Musify" style={{width:'80px', height:'80px', marginBottom:'20px'}} noFallback />
                <h1 style={{fontSize:'32px', marginBottom:'10px'}}>Welcome to Musify</h1>
                <p style={{fontSize:'16px', opacity:0.8, marginBottom:'40px'}}>Sign in to access your personalized music library</p>
                
                <button onClick={loginWithGoogle} style={{
                    width:'100%',
                    padding:'16px 24px',
                    background:'#fff',
                    color:'#333',
                    border:'none',
                    borderRadius:'30px',
                    fontSize:'16px',
                    fontWeight:600,
                    cursor:'pointer',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    gap:'12px',
                    transition:'all 0.3s'
                }}>
                    <svg width="20" height="20" viewBox="0 0 20 20">
                        <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"/>
                        <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"/>
                        <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"/>
                        <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"/>
                    </svg>
                    Continue with Google
                </button>

                <p style={{fontSize:'13px', opacity:0.6, marginTop:'30px'}}>
                    By continuing, you agree to Musify's Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
};

export default Login;
