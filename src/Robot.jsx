import { replace } from 'react-router-dom';
import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useTransform, useMotionValue, useAnimation, useVelocity } from 'framer-motion';
import { Heart } from 'lucide-react';

const Robot = ({ message, state = 'default', isScrollingFast = false }) => {
    // Mouse tracking
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Velocity for Dizzy detection
    const mouseXVelocity = useVelocity(mouseX);
    const [isDizzy, setIsDizzy] = useState(false);

    // State Colors
    const getColors = () => {
        switch (state) {
            case 'eco': return { primary: '#22c55e', secondary: '#4ade80', shadow: '#22c55e' }; // Green
            case 'work': return { primary: '#a855f7', secondary: '#c084fc', shadow: '#a855f7' }; // Purple
            case 'mail': return { primary: '#eab308', secondary: '#facc15', shadow: '#eab308' }; // Yellow
            default: return { primary: '#2dd4bf', secondary: '#5eead4', shadow: '#2dd4bf' }; // Teal
        }
    };
    const colors = getColors();

    const springConfig = { damping: 20, stiffness: 100, mass: 0.5 };
    const headRotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), springConfig);
    const headRotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), springConfig);

    // Body Parallax (Subtle lean)
    const bodyRotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), springConfig);
    const bodyRotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), springConfig);

    // --- Scared Logic ---
    const shakeX = useTransform(useSpring(useMotionValue(0), { stiffness: 500, damping: 10 }), [-1, 1], [-10, 10]);

    // --- Sleep Logic ---
    const [isSleeping, setIsSleeping] = useState(false);
    const sleepTimer = useRef(null);

    const resetSleepTimer = () => {
        setIsSleeping(false);
        clearTimeout(sleepTimer.current);
        sleepTimer.current = setTimeout(() => {
            // Only sleep if no message is showing and not scrolling/dizzy
            if (!message && !isScrollingFast && !isDizzy) setIsSleeping(true);
        }, 8000); // Sleep after 8s idle
    };

    // Eye Tracking
    const pupilsX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);
    const pupilsY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-5, 5]), springConfig);

    // State & Animations
    const controls = useAnimation();
    const [showBubble, setShowBubble] = useState(false);
    const [isBlinking, setIsBlinking] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [clickMode, setClickMode] = useState('normal'); // normal, love, confused

    // --- Dizzy Check ---
    useEffect(() => {
        return mouseXVelocity.on("change", (latest) => {
            if (Math.abs(latest) > 5 && !isDizzy) { // Threshold for "shaking"
                setIsDizzy(true);
                setTimeout(() => setIsDizzy(false), 2000); // Recover after 2s
            }
        });
    }, [mouseXVelocity, isDizzy]);


    // --- Interaction Effects ---
    useEffect(() => {
        if (isScrollingFast) { // Priority 1: Scared
            setIsSleeping(false);
            controls.start({
                y: [0, -5, 5, -5, 0],
                rotateZ: [-5, 5, -5, 5, 0],
                transition: { duration: 0.1, repeat: Infinity }
            });
        } else if (isDizzy) { // Priority 2: Dizzy
            setIsSleeping(false);
            controls.start({
                rotate: [0, 360],
                transition: { duration: 1, repeat: Infinity, ease: "linear" }
            });
        } else if (isSleeping) { // Priority 3: Sleep
            controls.start({
                y: [0, 5, 0],
                rotateX: [10, 15, 10],
                transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            });
        } else {
            // Normal / Reset
            controls.start({ y: 0, rotateZ: 0, rotateX: 0, rotate: 0 });
        }
    }, [isScrollingFast, isSleeping, isDizzy]);

    // ... Sleep/Activity Listeners (Existing) ...
    // Mouse activity resets sleep
    useEffect(() => {
        const handleActivity = () => resetSleepTimer();
        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('scroll', handleActivity);
        resetSleepTimer(); // Start timer

        return () => {
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('scroll', handleActivity);
            clearTimeout(sleepTimer.current);
        };
    }, [message, isScrollingFast, isDizzy]);

    // Mouse & Blink Logic (Existing) ...
    useEffect(() => {
        const handleMouseMove = (event) => {
            const { innerWidth, innerHeight } = window;
            const x = (event.clientX - innerWidth / 2) / innerWidth;
            const y = (event.clientY - innerHeight / 2) / innerHeight;
            mouseX.set(x);
            mouseY.set(y);
        };

        const blinkInterval = setInterval(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 150);
        }, 3000 + Math.random() * 2000);

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearInterval(blinkInterval);
        };
    }, []);

    const handleClick = () => {
        // Randomize Interaction
        const interactions = ['jump', 'love', 'spin'];
        const action = interactions[Math.floor(Math.random() * interactions.length)];

        if (action === 'love') {
            setClickMode('love');
            controls.start({
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0],
                transition: { duration: 0.5 }
            });
            setTimeout(() => setClickMode('normal'), 2000);
        } else if (action === 'spin') {
            setClickMode('confused'); // just for visual change if needed
            controls.start({
                rotateY: [0, 360],
                transition: { duration: 0.8, ease: "backInOut" }
            });
            setTimeout(() => setClickMode('normal'), 1000);
        } else {
            // Jump
            controls.start({
                y: [-10, -40, -10],
                scale: [1, 1.2, 1],
                transition: { duration: 0.6, type: "spring" }
            });
        }
    };

    // Message Handling (Existing) ...
    useEffect(() => {
        if (message) {
            setShowBubble(true);
            const timer = setTimeout(() => setShowBubble(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <div
            className="relative w-full h-full flex items-center justify-center pointer-events-auto cursor-pointer perspective-[800px]"
            onClick={handleClick}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* ... Bubbles (Existing) ... */}
            {/* SPEECH BUBBLE */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10, rotate: -5 }}
                animate={{
                    opacity: (showBubble && !isSleeping && !isDizzy) ? 1 : 0,
                    scale: (showBubble && !isSleeping && !isDizzy) ? 1 : 0.8,
                    y: (showBubble && !isSleeping && !isDizzy) ? -160 : 10,
                    rotate: (showBubble && !isSleeping && !isDizzy) ? 0 : -5
                }}
                className="absolute z-50 max-w-[200px]"
            >
                <div className="bg-white/90 backdrop-blur-md text-gray-900 px-5 py-3 rounded-2xl rounded-bl-none shadow-2xl border border-white/50 relative">
                    <p className="font-semibold text-sm leading-tight">{message || "System Online."}</p>
                    <div className="absolute -bottom-2 left-0 w-4 h-4 bg-white/90 transform rotate-45" />
                </div>
            </motion.div>

            {/* SLEEP BUBBLE (Existing) */}
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                    opacity: isSleeping ? 1 : 0,
                    scale: isSleeping ? 1 : 0,
                    y: isSleeping ? -140 : 0
                }}
                className="absolute z-50 right-0"
            >
                <motion.div
                    animate={{ y: [-5, -20], x: [0, 10], opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    className="text-4xl font-bold text-teal-200"
                >
                    Zzz...
                </motion.div>
            </motion.div>

            {/* DIZZY STARS (New) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isDizzy ? 1 : 0 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 z-50"
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="text-3xl"
                >
                    💫
                </motion.div>
            </motion.div>


            {/* MAIN ROBOT RIG */}
            <motion.div
                animate={controls}
                className="relative w-48 h-64 flex flex-col items-center transform-style-3d select-none"
            >
                {/* Floating Animation Wrapper */}
                <motion.div
                    animate={(isScrollingFast || isDizzy) ? {} : { y: [-10, 10, -10] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="transform-style-3d relative flex flex-col items-center"
                    style={{ rotateX: bodyRotateX, rotateY: bodyRotateY }} // Body Parallax
                >

                    {/* --- HEAD --- */}
                    <motion.div
                        style={{
                            rotateX: headRotateX,
                            rotateY: headRotateY,
                            x: isScrollingFast ? shakeX : 0
                        }}
                        className="relative w-36 h-32 z-20 transform-style-3d"
                    >
                        {/* Helmet (Existing) */}
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-black rounded-[2.5rem] shadow-xl border border-slate-700 overflow-hidden ring-1 ring-teal-500/20">
                            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                            {/* FACE SCREEN */}
                            <div className="absolute top-4 left-3 right-3 bottom-8 bg-black rounded-[2rem] border border-gray-800 shadow-[inset_0_0_20px_black] flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #2dd4bf 1px, transparent 1px)', backgroundSize: '10px 10px' }} />

                                {/* EYES */}
                                <div className="flex gap-4 z-10 transition-all duration-300">
                                    {/* Handle Love Mode or Normal */}
                                    {clickMode === 'love' ? (
                                        <>
                                            <Heart className="w-8 h-8 text-pink-500 fill-pink-500 animate-pulse" />
                                            <Heart className="w-8 h-8 text-pink-500 fill-pink-500 animate-pulse" />
                                        </>
                                    ) : (
                                        <>
                                            {/* Left Eye */}
                                            <motion.div
                                                style={{ x: pupilsX, y: pupilsY, backgroundColor: colors.primary }}
                                                animate={{
                                                    scaleY: isSleeping ? 0.1 : (isBlinking ? 0.1 : (isScrollingFast ? 1.5 : (isDizzy ? 0.5 : 1))),
                                                    height: isSleeping ? 2 : (isScrollingFast ? 30 : (isHovering ? 45 : (isDizzy ? 10 : 40))),
                                                    width: isDizzy ? 30 : 32, // Widen for swirl effect if we had it, or just squint
                                                    boxShadow: isHovering ? `0 0 30px ${colors.shadow}` : `0 0 20px ${colors.shadow}`,
                                                    rotate: isDizzy ? 180 : 0
                                                }}
                                                className="relative w-8 rounded-full flex items-center justify-center transition-all duration-300"
                                            >
                                                <div className="w-2 h-3 bg-white rounded-full opacity-80 -mt-3 -ml-2" />
                                            </motion.div>

                                            {/* Right Eye */}
                                            <motion.div
                                                style={{ x: pupilsX, y: pupilsY, backgroundColor: colors.primary }}
                                                animate={{
                                                    scaleY: isSleeping ? 0.1 : (isBlinking ? 0.1 : (isScrollingFast ? 1.5 : (isDizzy ? 0.5 : 1))),
                                                    height: isSleeping ? 2 : (isScrollingFast ? 30 : (isHovering ? 45 : (isDizzy ? 10 : 40))),
                                                    width: isDizzy ? 30 : 32,
                                                    boxShadow: isHovering ? `0 0 30px ${colors.shadow}` : `0 0 20px ${colors.shadow}`,
                                                    rotate: isDizzy ? -180 : 0
                                                }}
                                                className="relative w-8 rounded-full flex items-center justify-center transition-all duration-300"
                                            >
                                                <div className="w-2 h-3 bg-white rounded-full opacity-80 -mt-3 -ml-2" />
                                            </motion.div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Voice/Mouth Visualizer */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                                {[1, 2, 3, 4].map(i => (
                                    <motion.div
                                        key={i}
                                        style={{ backgroundColor: colors.secondary }}
                                        animate={{ height: [2, 6, 2], opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                                        className="w-1 rounded-full transition-colors duration-500"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Side Ears/Antennae */}
                        <div className="absolute top-10 -left-4 w-6 h-12 bg-slate-800 rounded-l-xl border-l border-slate-600 shadow-lg -z-10 flex items-center justify-center">
                            <div className="w-1.5 h-6 bg-teal-500/30 rounded-full blur-[1px]" />
                        </div>
                        <div className="absolute top-10 -right-4 w-6 h-12 bg-slate-800 rounded-r-xl border-r border-slate-600 shadow-lg -z-10 flex items-center justify-center">
                            <div className="w-1.5 h-6 bg-teal-500/30 rounded-full blur-[1px]" />
                        </div>

                        {/* Top Hologram Projector */}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-slate-700 rounded-t-lg" />
                    </motion.div>


                    {/* --- BODY --- */}
                    <div className="relative -mt-5 z-10 w-24 h-28 transform-style-3d">
                        {/* Torso */}
                        <div className="w-full h-full bg-gradient-to-br from-slate-800 to-black rounded-[2rem] border border-slate-700 shadow-2xl flex flex-col items-center pt-8 overflow-hidden relative">
                            {/* Central Reactor Core */}
                            <div className="w-12 h-12 rounded-full border-[3px] border-slate-700 bg-black flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.05)] relative z-10">
                                <motion.div
                                    style={{ background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})` }}
                                    animate={{
                                        scale: isHovering ? [1, 1.2, 1] : [1, 1.1, 1],
                                        opacity: [0.8, 1, 0.8],
                                        boxShadow: isHovering ? `0 0 40px ${colors.shadow}` : `0 0 20px ${colors.shadow}`,
                                        rotate: isHovering ? 360 : 0
                                    }}
                                    transition={{
                                        duration: isHovering ? 0.5 : 2,
                                        repeat: Infinity,
                                        ease: isHovering ? "linear" : "easeInOut"
                                    }}
                                    className="w-6 h-6 rounded-full transition-all duration-500"
                                />
                            </div>

                            {/* Body Details */}
                            <div className="w-full h-[1px] bg-slate-700 mt-6" />
                            <div className="flex gap-4 mt-2">
                                <div className="w-1 h-3 bg-slate-600 rounded-full" />
                                <div className="w-1 h-3 bg-slate-600 rounded-full" />
                            </div>
                        </div>

                        {/* Floating Arms */}
                        <motion.div
                            style={{ rotateX: headRotateX }}
                            className="absolute top-8 -left-8 w-6 h-16 bg-gradient-to-b from-slate-700 to-slate-800 rounded-2xl border border-slate-600 shadow-xl"
                        />
                        <motion.div
                            style={{ rotateX: headRotateX }}
                            className="absolute top-8 -right-8 w-6 h-16 bg-gradient-to-b from-slate-700 to-slate-800 rounded-2xl border border-slate-600 shadow-xl"
                        />
                    </div>

                    {/* --- THRUSTER / SHADOW --- */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 pointer-events-none">
                        {/* Blue Thruster Glow */}
                        <motion.div
                            animate={{ height: [10, 20, 10], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 0.2, repeat: Infinity }}
                            className="w-8 bg-blue-500/40 blur-xl rounded-full"
                        />
                    </div>

                </motion.div>

                {/* Ground Shadow */}
                <motion.div
                    animate={{ scale: [1, 0.8, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[-40px] w-32 h-4 bg-black/60 blur-lg rounded-[100%]"
                />

            </motion.div>
        </div>
    );
};

export default Robot;
