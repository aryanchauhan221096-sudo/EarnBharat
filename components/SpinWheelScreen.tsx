

import React, { useState, useEffect, useRef } from 'react';
import { User } from '../App';
import { addCoins } from '../managers/CoinManager';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { CoinIcon } from './icons/CoinIcon';
import { db } from '../firebase';
// FIX: Import firebase v8 namespace for Timestamp type. Other functions are called on the db instance.
// FIX: Use namespace import for firebase compat app and import firestore for types.
import * as firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { VideoAdIcon } from './icons/VideoAdIcon';
import { XMarkIcon } from './icons/XMarkIcon';

interface SpinWheelScreenProps {
  user: User;
  onBack: () => void;
}

const segments = [
    { value: 10, label: '10', color: '#f59e0b' },      // amber-500
    { value: 50, label: '50', color: '#ea580c' },      // orange-600
    { value: 5, label: '5', color: '#fcd34d' },       // amber-300
    { value: 100, label: '100', color: '#d97706' },     // amber-600
    { value: 0, label: 'Try Again', color: '#6b7280' },// gray-500
    { value: 20, label: '20', color: '#fbbf24' },      // amber-400
    { value: 200, label: 'JACKPOT', color: '#dc2626' },// red-600
    { value: 25, label: '25', color: '#f97316' },      // orange-500
];
const segmentAngle = 360 / segments.length;
const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

interface RewardTransaction {
    id: string;
    amount: number;
    date: string;
}

// New SVG Wheel Component
const WheelSVG: React.FC = () => {
    const radius = 140;
    const centerX = 150;
    const centerY = 150;

    const getCoordinatesForAngle = (angle: number, r: number) => {
        const rads = (angle - 90) * Math.PI / 180.0;
        return {
            x: centerX + r * Math.cos(rads),
            y: centerY + r * Math.sin(rads),
        };
    };

    return (
        <svg width="300" height="300" viewBox="0 0 300 300" className="drop-shadow-xl">
            <defs>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#000" floodOpacity="0.3"/>
                </filter>
            </defs>
            <g filter="url(#shadow)">
                {segments.map((segment, index) => {
                    const startAngle = index * segmentAngle;
                    const endAngle = startAngle + segmentAngle;

                    const start = getCoordinatesForAngle(startAngle, radius);
                    const end = getCoordinatesForAngle(endAngle, radius);
                    
                    const largeArcFlag = segmentAngle > 180 ? 1 : 0;
                    const pathData = `M ${centerX},${centerY} L ${start.x},${start.y} A ${radius},${radius} 0 ${largeArcFlag} 1 ${end.x},${end.y} Z`;

                    const textAngle = startAngle + segmentAngle / 2;
                    const textPos = getCoordinatesForAngle(textAngle, radius * 0.65);
                    
                    const isJackpot = segment.label === 'JACKPOT';

                    return (
                        <g key={index}>
                            <path d={pathData} fill={segment.color} stroke="#FFFFFF" strokeWidth="2" />
                            <text
                                x={textPos.x}
                                y={textPos.y}
                                fill="white"
                                textAnchor="middle"
                                alignmentBaseline="middle"
                                fontSize={isJackpot ? "16" : "22"}
                                fontWeight="bold"
                                transform={`rotate(${textAngle}, ${textPos.x}, ${textPos.y})`}
                                className="drop-shadow-sm"
                            >
                                {segment.label}
                            </text>
                            {segment.value > 0 && !isJackpot && (
                                <text
                                    x={textPos.x}
                                    y={textPos.y + 20}
                                    fill="white"
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                    fontSize="12"
                                    fontWeight="normal"
                                    transform={`rotate(${textAngle}, ${textPos.x}, ${textPos.y})`}
                                     className="drop-shadow-sm"
                                >
                                    Coins
                                </text>
                            )}
                        </g>
                    );
                })}
            </g>
        </svg>
    );
};

// New Jackpot Celebration Component
const JackpotCelebration: React.FC = () => {
    const confettiColors = ['#f59e0b', '#ea580c', '#fcd34d', '#dc2626', '#fbbf24', '#ffffff'];
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        // Create audio context on mount
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        const playSound = () => {
            if (!audioContextRef.current) return;
            const oscillator = audioContextRef.current.createOscillator();
            const gainNode = audioContextRef.current.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContextRef.current.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioContextRef.current.currentTime); // A5
            gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
            
            gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContextRef.current.currentTime + 1.5);
            oscillator.start(audioContextRef.current.currentTime);
            oscillator.stop(audioContextRef.current.currentTime + 1.5);
        };
        
        playSound();

        return () => {
            audioContextRef.current?.close();
        };

    }, []);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none" aria-hidden="true">
            {/* Jackpot Text */}
            <h1 
                className="animate-jackpot-text text-8xl md:text-9xl font-black text-yellow-300 drop-shadow-lg"
                style={{
                    textShadow: '0 0 10px #fff, 0 0 20px #fef08a, 0 0 40px #f59e0b, 0 0 60px #dc2626'
                }}
            >
                JACKPOT!
            </h1>

            {/* Confetti */}
            {[...Array(60)].map((_, i) => {
                const style = {
                    left: `${Math.random() * 100}vw`,
                    animationDelay: `${Math.random() * 4}s`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                    backgroundColor: confettiColors[Math.floor(Math.random() * confettiColors.length)],
                    transform: `scale(${Math.random() * 0.7 + 0.5}) rotate(${Math.random() * 360}deg)`,
                };
                return <div key={i} className="confetti" style={style}></div>;
            })}
        </div>
    );
};


const SpinWheelScreen: React.FC<SpinWheelScreenProps> = ({ user, onBack }) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [result, setResult] = useState<typeof segments[0] | null>(null);
    const [showResultModal, setShowResultModal] = useState(false);
    const [canSpin, setCanSpin] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');
    const [showJackpot, setShowJackpot] = useState(false);
    const cooldownIntervalRef = useRef<number | null>(null);

    // Ad state
    const [isAdPlaying, setIsAdPlaying] = useState(false);
    const [adCountdown, setAdCountdown] = useState(15);
    const adIntervalRef = useRef<number | null>(null);
    
    // History state
    const [rewardHistory, setRewardHistory] = useState<RewardTransaction[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    const balanceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkCooldown = () => {
            const lastSpinTime = localStorage.getItem(`lastSpin_${user.uid}`);
            if (lastSpinTime) {
                const timePassed = Date.now() - parseInt(lastSpinTime, 10);
                if (timePassed < COOLDOWN_MS) {
                    setCanSpin(false);
                    startCooldownTimer(COOLDOWN_MS - timePassed);
                } else {
                    setCanSpin(true);
                }
            } else {
                setCanSpin(true);
            }
        };

        checkCooldown();
        return () => {
            if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
        };
    }, [user.uid]);

    useEffect(() => {
        // Real-time listener for reward history
        // FIX: Use Firebase v8 syntax to reference a collection.
        const transactionsColRef = db.collection('users').doc(user.uid).collection('transactions');
        // FIX: Use Firebase v8 syntax for querying.
        const q = transactionsColRef.orderBy('createdAt', 'desc');

        // FIX: Use Firebase v8 syntax for onSnapshot.
        const unsubscribe = q.onSnapshot((querySnapshot) => {
            const history: RewardTransaction[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.category === 'spin_and_win') {
                    // FIX: Use firebase.firestore.Timestamp for type casting.
                    const createdAt = data.createdAt as firebase.firestore.Timestamp;
                    history.push({
                        id: doc.id,
                        amount: data.amount,
                        date: createdAt ? createdAt.toDate().toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric'
                        }) : 'Just now',
                    });
                }
            });
            setRewardHistory(history);
            setLoadingHistory(false);
        });

        return () => unsubscribe(); // Cleanup listener
    }, [user.uid]);

    useEffect(() => {
        if (isAdPlaying && adCountdown > 0) {
            adIntervalRef.current = window.setInterval(() => {
                setAdCountdown(prev => prev - 1);
            }, 1000);
        } else if (adCountdown === 0) {
            if (adIntervalRef.current) clearInterval(adIntervalRef.current);
        }
        return () => {
            if (adIntervalRef.current) clearInterval(adIntervalRef.current);
        };
    }, [isAdPlaying, adCountdown]);

    const startCooldownTimer = (duration: number) => {
        if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
        let remaining = duration;
        
        const updateTimer = () => {
            const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((remaining / (1000 * 60)) % 60);
            const seconds = Math.floor((remaining / 1000) % 60);
            setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        };

        updateTimer();

        cooldownIntervalRef.current = window.setInterval(() => {
            remaining -= 1000;
            if (remaining <= 0) {
                if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
                setTimeLeft('');
                setCanSpin(true);
            } else {
                updateTimer();
            }
        }, 1000);
    };

    const handleWatchAd = () => {
        if (!canSpin || isSpinning) return;
        setIsAdPlaying(true);
        setAdCountdown(15);
    };
    
    const handleCloseAd = () => {
        setIsAdPlaying(false);
        if (adIntervalRef.current) clearInterval(adIntervalRef.current);
    }

    const handleSpin = () => {
        setIsAdPlaying(false);
        setIsSpinning(true);
        setResult(null);

        const randomIndex = Math.floor(Math.random() * segments.length);
        const prize = segments[randomIndex];
        const winningSegmentCenter = randomIndex * segmentAngle + segmentAngle / 2;
        const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.8;
        const targetAngle = -winningSegmentCenter - randomOffset;
        const newRotation = rotation + 360 * 6 + targetAngle;

        setRotation(newRotation);

        setTimeout(() => {
            setResult(prize);
            
            if (prize.label === 'JACKPOT') {
                setShowJackpot(true);
                setTimeout(() => {
                    setShowResultModal(true);
                    setShowJackpot(false);
                }, 4000);
            } else {
                setShowResultModal(true);
            }
        }, 6000);
    };

    const handleModalClose = async () => {
        setShowResultModal(false);
        if (result && result.value > 0) {
            sessionStorage.setItem('spin_win_reward', String(result.value));
            await addCoins(user.uid, result.value, 'Spin & Win Reward', 'spin_and_win');
        }
        setIsSpinning(false);
        localStorage.setItem(`lastSpin_${user.uid}`, String(Date.now()));
        setCanSpin(false);
        startCooldownTimer(COOLDOWN_MS);
    };

    const renderHistory = () => {
        if (loadingHistory) {
            return <div className="text-center text-gray-500 p-4">Loading History...</div>;
        }
        if (rewardHistory.length === 0) {
            return <div className="text-center text-gray-500 p-4">You haven't spun the wheel yet.</div>;
        }
        return (
            <div className="bg-white rounded-xl shadow-sm mt-6">
                {rewardHistory.map((item, index) => (
                    <div key={item.id} className="flex items-center p-3 border-b border-gray-100 last:border-b-0 animate-slide-in-bottom" style={{ animationDelay: `${index * 100}ms` }}>
                        <div className="text-green-500"><PlusCircleIcon className="w-7 h-7" /></div>
                        <div className="flex-grow ml-3">
                            <p className="font-semibold text-gray-800">Spin Reward</p>
                            <p className="text-xs text-gray-500">{item.date}</p>
                        </div>
                        <p className="font-bold text-green-500">+{item.amount} Coins</p>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F5F5F5] font-sans overflow-hidden">
            {showJackpot && <JackpotCelebration />}
            <header className="bg-white sticky top-0 z-30 shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <button onClick={onBack} className="text-gray-600 hover:text-[#FF6B00]">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold text-[#1B1B1B]">Spin & Win</h1>
                    <div className="w-6"></div>
                </div>
            </header>

            <main className="container mx-auto p-4 flex flex-col items-center justify-center text-center">
                <div ref={balanceRef} className="bg-white rounded-xl shadow-md p-4 mb-8 w-full max-w-sm animate-fade-scale-in">
                    <p className="text-sm text-gray-500">Your Coin Balance</p>
                    <div className="flex items-center justify-center mt-1">
                        <CoinIcon className="w-7 h-7 mr-2" />
                        <p className="text-3xl font-bold text-gray-800">{user.coins.toLocaleString()}</p>
                    </div>
                </div>

                <div className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center mb-8">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20" style={{ filter: 'drop-shadow(0 4px 3px rgba(0,0,0,0.3))' }}>
                        <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[24px] border-l-transparent border-r-transparent border-b-red-600"></div>
                    </div>
                    
                    <div 
                        className="relative w-[300px] h-[300px] rounded-full transition-transform duration-[6000ms] ease-out"
                        style={{ transform: `rotate(${rotation}deg)` }}
                    >
                        <WheelSVG />
                    </div>

                    <button 
                        onClick={handleWatchAd}
                        disabled={!canSpin || isSpinning}
                        className="absolute w-24 h-24 bg-white rounded-full border-8 border-amber-400 flex items-center justify-center shadow-lg transition-transform active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-200"
                    >
                        {canSpin ? (
                             <span className="font-extrabold text-amber-600 text-2xl drop-shadow-sm">SPIN</span>
                        ) : (
                             <span className="font-bold text-gray-700 text-lg tracking-tighter">{timeLeft}</span>
                        )}
                    </button>
                </div>

                 <section className="w-full max-w-sm">
                    <h2 className="text-lg font-bold text-gray-800 mb-2">Spin History</h2>
                    {renderHistory()}
                </section>
            </main>

            {showResultModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 text-center w-80 shadow-2xl animate-fade-scale-in">
                        {result?.value && result.value > 0 ? (
                            <>
                                <h2 className="text-2xl font-bold text-amber-500 mb-2">{result.label === 'JACKPOT' ? 'JACKPOT WINNER!' : 'Congratulations!'}</h2>
                                <p className="text-lg text-gray-700 mb-4">You won</p>
                                <div className="flex items-center justify-center text-4xl font-bold text-gray-800 mb-6">
                                    <CoinIcon className="w-10 h-10 mr-3" />
                                    <span>{result.value}</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold text-gray-700 mb-4">Better Luck Next Time!</h2>
                                <p className="text-lg text-gray-600 mb-6">You landed on "Try Again". Don't worry, you can spin again soon!</p>
                            </>
                        )}
                        <button onClick={handleModalClose} className="w-full bg-amber-500 text-white font-bold py-3 rounded-full hover:bg-amber-600 transition-colors">
                            Awesome!
                        </button>
                    </div>
                </div>
            )}

            {isAdPlaying && (
                 <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4 animate-fade-scale-in">
                    <button onClick={handleCloseAd} className="absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 text-white disabled:opacity-50" disabled={adCountdown > 0}>
                        <XMarkIcon className="w-6 h-6" />
                    </button>

                    <div className="text-center text-white">
                        {adCountdown > 0 ? (
                            <>
                                <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                                    <svg className="absolute w-full h-full" viewBox="0 0 120 120">
                                        <circle className="text-gray-700" strokeWidth="10" stroke="currentColor" fill="transparent" r="52" cx="60" cy="60" />
                                        <circle className="text-amber-400" style={{ transition: 'stroke-dashoffset 1s linear' }} strokeWidth="10" strokeDasharray={327} strokeDashoffset={327 - (adCountdown / 15) * 327} strokeLinecap="round" stroke="currentColor" fill="transparent" r="52" cx="60" cy="60" transform="rotate(-90 60 60)" />
                                    </svg>
                                    <span className="text-white text-5xl font-bold font-mono z-10">{adCountdown}</span>
                                </div>
                                <h2 className="text-2xl font-bold">Ad in Progress</h2>
                                <p className="mt-1 text-gray-300">Watch the ad to spin the wheel!</p>
                            </>
                        ) : (
                            <>
                                <VideoAdIcon className="w-32 h-32 mx-auto text-amber-400 mb-4" />
                                <h2 className="text-3xl font-bold mt-4">Ad Finished!</h2>
                                <p className="mt-2 text-green-400 font-semibold mb-6">You can now spin the wheel for a reward.</p>
                                <button onClick={handleSpin} className="w-full max-w-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-4 px-6 rounded-full shadow-lg hover:scale-105 transition-transform duration-300">
                                    Spin Now
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpinWheelScreen;