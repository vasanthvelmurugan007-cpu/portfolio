import React, { useRef, useEffect } from 'react';
import Robot from './Robot';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate, useVelocity, AnimatePresence } from 'framer-motion';
import { Github, Linkedin, Mail, ExternalLink, Heart, Globe, Recycle, Zap, Users, Code2, Terminal, Database, Layout, Cpu } from 'lucide-react';

// --- Animated "Fireflies" Background ---
const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let particles = [];
    let animationFrameId;

    const createParticles = () => {
      particles = [];
      for (let i = 0; i < 60; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 3, // slightly larger, glowy
          alpha: Math.random() * 0.5 + 0.2,
          pulse: Math.random() * 0.05,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.pulse;
        if (p.alpha > 0.8 || p.alpha < 0.2) p.pulse *= -1;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(45, 212, 191, 0.5)"; // Teal glow
        ctx.fillStyle = `rgba(45, 212, 191, ${p.alpha})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      createParticles();
    };

    createParticles();
    animate();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 bg-[#0a0a0a] pointer-events-none" />;
};

// --- Components ---

const Navbar = () => (
  <motion.nav
    initial={{ y: -100 }}
    animate={{ y: 0 }}
    transition={{ type: "spring", stiffness: 100, damping: 20 }}
    className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none"
  >
    <div className="pointer-events-auto flex items-center gap-1 p-1 rounded-full border border-teal-500/20 bg-black/60 backdrop-blur-xl shadow-[0_0_30px_rgba(45,212,191,0.1)]">
      {['Mission', 'Impact', 'Work', 'Contact'].map((item) => (
        <a
          key={item}
          href={`#${item.toLowerCase()}`}
          className="px-6 py-2.5 text-sm font-medium text-gray-400 hover:text-teal-400 hover:bg-teal-500/10 rounded-full transition-all duration-300"
        >
          {item}
        </a>
      ))}
    </div>
  </motion.nav>
);

const Section = ({ id, children, className = "" }) => (
  <section id={id} className={`min-h-screen relative flex flex-col justify-center px-6 py-20 ${className}`}>
    {children}
  </section>
);

const ImpactCard = ({ icon: Icon, title, desc }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="p-8 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-teal-500/30 transition-colors relative overflow-hidden group"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-teal-500/20 transition-colors" />
    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-6 text-teal-400 group-hover:scale-110 transition-transform">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-gray-400 leading-relaxed text-sm">{desc}</p>
  </motion.div>
);

const ProjectCard = ({ title, tagline, problem, solution, tags, color = "teal", link }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const gradientColor = color === "teal" ? "rgba(45, 212, 191, 0.15)" : "rgba(192, 132, 252, 0.15)";
  const textColor = color === "teal" ? "text-teal-400" : "text-purple-400";

  return (
    <div
      className="group relative h-full border border-white/10 bg-gray-900/40 overflow-hidden rounded-3xl hover:border-white/20 transition-all duration-500"
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              ${gradientColor},
              transparent 80%
            )
          `,
        }}
      />
      <div className="p-8 md:p-10 flex flex-col h-full relative z-10">
        <div className="flex justify-between items-start mb-6">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 ${textColor} border border-white/5`}>
            {tagline}
          </span>
          {link ? (
            <a href={link} target="_blank" rel="noopener noreferrer" className="p-2 -mt-2 -mr-2 rounded-full hover:bg-white/10 transition-colors">
              <ExternalLink className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
            </a>
          ) : (
            <ExternalLink className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors cursor-not-allowed" />
          )}
        </div>

        <h3 className="text-3xl font-bold text-white mb-6 group-hover:translate-x-1 transition-transform">{title}</h3>

        <div className="space-y-4 mb-8 flex-grow">
          <div>
            <span className="text-xs uppercase text-gray-500 font-bold tracking-wider">Problem</span>
            <p className="text-gray-300 mt-1">{problem}</p>
          </div>
          <div>
            <span className="text-xs uppercase text-gray-500 font-bold tracking-wider">Solution</span>
            <p className="text-gray-300 mt-1">{solution}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-6 border-t border-white/5">
          {tags.map(tag => (
            <span key={tag} className="text-xs font-medium px-3 py-1 text-gray-400">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const { scrollY, scrollYProgress } = useScroll();

  // Section Tracking
  const [activeSection, setActiveSection] = React.useState('mission');
  const [robotMessage, setRobotMessage] = React.useState("Hi! I am Aura, Vasanth's AI Assistant. 👋");
  const [robotState, setRobotState] = React.useState('default');

  useEffect(() => {
    const sections = ['mission', 'impact', 'work', 'contact'];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            if (activeSection !== section) {
              setActiveSection(section);
              // Update Message & State based on section
              switch (section) {
                case 'mission':
                  setRobotMessage("Hi! I am Aura, Vasanth's AI Assistant. 👋");
                  setRobotState('default'); // Blue/Teal
                  break;
                case 'impact':
                  setRobotMessage("Here's what drives my engineering. 🌱");
                  setRobotState('eco'); // Green
                  break;
                case 'work':
                  setRobotMessage("Check out these projects! Click for details. 🚀");
                  setRobotState('work'); // Purple/Orange
                  break;
                case 'contact':
                  setRobotMessage("Ready to build something amazing together? 📬");
                  setRobotState('mail'); // Yellow/Gold
                  break;
              }
            }
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);
  // Auto-scroll to Name on Load
  const nameRef = useRef(null);

  useEffect(() => {
    // Initial Greeting Delay
    const timer = setTimeout(() => {
      if (nameRef.current) {
        nameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 2500); // Wait 2.5s for the user to see the robot greeting first

    return () => clearTimeout(timer);
  }, []);

  // Robot Travel Transforms - Percentage based (Top/Left)
  const robotScale = useTransform(scrollY, [0, 800], [0.8, 0.4]); // Smaller on scroll (0.4)
  const robotX = useTransform(scrollY, [0, 800], ['80%', '88%']); // Tucked in corner
  const robotY = useTransform(scrollY, [0, 800], ['75%', '86%']); // Start lower (75%) to avoid text overlap

  // --- Feature 1: "Scared of Speed" ---
  const scrollVelocity = useVelocity(scrollY);
  const [isScrollingFast, setIsScrollingFast] = React.useState(false);

  useEffect(() => {
    return scrollVelocity.on("change", (latest) => {
      // If velocity is > 800 (abitrary fast scroll), trigger scared mode
      if (Math.abs(latest) > 800) {
        setIsScrollingFast(true);
        // Reset after a moment of no high velocity
        clearTimeout(window.scrollTimer);
        window.scrollTimer = setTimeout(() => setIsScrollingFast(false), 200);
      }
    });
  }, [scrollVelocity]);

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // --- Intro Sequence ---
  // --- Intro Sequence ---
  const [showIntro, setShowIntro] = React.useState(true);
  const [introMessage, setIntroMessage] = React.useState("");
  const [isLaunching, setIsLaunching] = React.useState(false);

  useEffect(() => {
    // Lock scroll during intro
    if (showIntro) {
      document.body.style.overflow = 'hidden';
      window.scrollTo(0, 0); // Ensure we are at top
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cinematic Sequence
    const sequence = async () => {
      // 0.0s - Start (Blank Black Screen)

      // 0.5s - Robot Flies In
      setIsLaunching(true);
      await new Promise(r => setTimeout(r, 600)); // Fly duration
      setIsLaunching(false);

      // 1.2s - First Message
      setIntroMessage("Hello! 👋");
      await new Promise(r => setTimeout(r, 2000));

      // 3.2s - Second Message
      setIntroMessage("Initializing Mission Control...");
      await new Promise(r => setTimeout(r, 1500));

      // 4.7s - End
      setShowIntro(false);
    };

    sequence();
  }, [showIntro]);

  return (
    <div className="min-h-screen text-white selection:bg-teal-500/30 selection:text-white font-sans overflow-x-hidden">

      {/* --- INTRO OVERLAY --- */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          >
            <motion.div
              initial={{ y: 400, scale: 0.5, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{
                y: { type: "spring", stiffness: 60, damping: 15 },
                scale: { duration: 0.8, ease: "backOut" },
                opacity: { duration: 0.5 }
              }}
            >
              <Robot message={introMessage} state="default" isLaunching={isLaunching} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ParticleBackground />

      {/* Scroll Progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-purple-500 to-teal-400 z-[60] origin-left"
        style={{ scaleX }}
      />

      <Navbar />

      <main className="container mx-auto max-w-6xl px-4 relative z-30">

        {/* HERO */}
        <Section id="mission" className="pt-20 md:pt-0">
          <div className="grid md:grid-cols-2 gap-8 items-center h-full">

            {/* Left Col: Text & Mission */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-left flex flex-col justify-center md:pt-16" // Added md:pt-16 to push down
            >


              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300 text-xs font-semibold self-start"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                Engineering for Social Good
              </motion.div>

              <h1 ref={nameRef} className="text-5xl md:text-8xl font-bold tracking-tighter mb-4 text-white leading-none">
                Vasanth<span className="text-teal-500">.</span>
              </h1>

              <h2 className="text-2xl md:text-4xl font-bold text-gray-400 mb-6 leading-tight">
                I build technology that <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-400">empowers communities.</span>
              </h2>

              <p className="text-lg text-gray-500 max-w-xl mb-8">
                Full Stack Developer transforming complex social problems into elegant, accessible software solutions.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <a href="#work" className="px-8 py-3 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-full transition-all hover:scale-105">
                  Explore My Impact
                </a>
                <a href="#contact" className="px-8 py-3 border border-white/20 hover:bg-white/5 text-white font-semibold rounded-full transition-all">
                  Get in Touch
                </a>
              </div>

              {/* Compact Mission Statement */}
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                <h3 className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-2">/// The Mission</h3>
                <p className="text-gray-300 font-light italic">
                  "To democratize access to digital tools, ensuring that non-profits and small businesses have the same technological firepower as industry giants."
                </p>
              </div>

            </motion.div>

            {/* Right Col: Robot Area (Visual Only, Robot is Fixed) */}
            <div className="hidden md:flex items-center justify-center h-full relative">
              {/* Decorative Element to 'anchor' the robot visually */}
              <div className="absolute w-[400px] h-[400px] bg-teal-500/10 blur-[120px] rounded-full animate-pulse" />
            </div>

          </div>
        </Section>

        {/* IMPACT VALUES */}
        <Section id="impact">
          <div className="grid md:grid-cols-3 gap-6">
            <ImpactCard
              icon={Globe}
              title="Sustainability First"
              desc="Every line of code consumes energy. I build lightweight, efficient applications that reduce digital carbon footprints."
            />
            <ImpactCard
              icon={Heart}
              title="Human-Centric Design"
              desc="Technology should serve people, not the other way around. Accessibility and inclusivity are core to my process."
            />
            <ImpactCard
              icon={Zap}
              title="Utility Driven"
              desc="I don't just build for the sake of it. I focus on tools that solve real frictions—from inventory management to logistics."
            />
          </div>
        </Section>

        {/* WORK */}
        <Section id="work">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="mb-16 flex items-end justify-between border-b border-white/10 pb-8"
          >
            <div>
              <h2 className="text-5xl font-bold mb-2">My Work</h2>
              <p className="text-gray-500 text-lg">Case studies in solving real-world problems.</p>
            </div>
            <div className="hidden md:block text-gray-600 font-mono">
                // SELECTED_PROJECTS_2026
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ProjectCard
              color="teal"
              title="UnityHub"
              tagline="College Mini Project"
              problem="Volunteering opportunities in local communities are often fragmented and hard to find."
              solution="A centralized social impact platform connecting volunteers with certified NGOs, featuring real-time impact tracking and event management."
              tags={['React', 'Tailwind', 'Social Impact']}
              link="http://localhost:5174"
            />

            <ProjectCard
              color="purple"
              title="Smart Compare"
              tagline="Sustainable Commerce"
              problem="Consumers waste money and carbon emissions on inefficient shipping and lack of recycling options."
              solution="An aggregator prioritizing 'Delivery Speed' to optimize logistics, featuring 'Smart Swap'—a P2P barter system that keeps products out of landfills."
              tags={['Next.js', 'Python Scrapy', 'Green Tech']}
            />

            <ProjectCard
              color="teal"
              title="Aakritii NGO Platform"
              tagline="Non-Profit Digitization"
              problem="Local NGOs struggle to showcase their work and attract digital-first donors, limiting their social reach."
              solution="A high-performance, accessible web platform with dynamic galleries ('Pillars of Hope') that increased engagement and event visibility."
              tags={['FastAPI', 'React', 'Social Impact']}
            />

            <ProjectCard
              color="purple"
              title="Business OS Suite"
              tagline="SME Empowerment"
              problem="Small businesses lose hours manually tracking inventory and struggling with complex GSTR-1 tax compliance."
              solution="A comprehensive billing & stock system with automated deductions and one-click tax exports, saving 10+ hours/week for owners."
              tags={['MERN Stack', 'Automation', 'FinTech']}
            />

            <ProjectCard
              color="teal"
              title="Hope Gallery"
              tagline="Digital Preservation"
              problem="Documentation of social work often gets lost in disordered file systems."
              solution="An interactive, lag-free image archive handling bulk uploads to preserve memories of community service seamlessly."
              tags={['Optimization', 'UX Design', 'Cloudinary']}
            />
          </div>
        </Section>

        {/* CONTACT */}
        <Section id="contact" className="items-center text-center">
          <div className="w-full max-w-4xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-[3rem] p-12 md:p-24 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.1),transparent_70%)] pointer-events-none" />

            <h2 className="text-5xl md:text-7xl font-bold mb-8 relative z-10">Start a conversation.</h2>
            <p className="text-xl text-gray-400 mb-12 max-w-xl mx-auto relative z-10">
              I'm looking for opportunities to apply my engineering skills to meaningful missions.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
              <a href="mailto:ignitefreelancer@gmail.com" className="inline-flex justify-center items-center gap-3 px-8 py-4 bg-white text-black font-bold text-lg rounded-full hover:bg-teal-50 transition-colors duration-300">
                <Mail className="w-5 h-5" />
                ignitefreelancer@gmail.com
              </a>
              <div className="flex justify-center gap-4">
                <a href="https://github.com/vasanthvelmurugan007-cpu" className="p-4 rounded-full bg-black/50 border border-white/10 hover:border-teal-400 hover:text-teal-400 transition-colors">
                  <Github className="w-6 h-6" />
                </a>
                <a href="https://www.linkedin.com/in/vasanth-velmurugan-3a8497321" className="p-4 rounded-full bg-black/50 border border-white/10 hover:border-teal-400 hover:text-teal-400 transition-colors">
                  <Linkedin className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </Section>

        <footer className="py-12 text-center border-t border-white/5 text-gray-600 font-mono text-xs">
          <p>ENGINEERED FOR IMPACT IN BANGALORE, INDIA. © 2026</p>
        </footer>

      </main>

      {/* TRAVELING ROBOT COMPANION - Full Screen Overlay for precise control */}
      <motion.div
        className={`fixed inset-0 z-20 pointer-events-none ${showIntro ? 'opacity-0' : 'opacity-100 transition-opacity duration-1000'}`}
      >
        <motion.div
          className="absolute w-64 h-80 flex items-center justify-center"
          style={{
            top: robotY,
            left: robotX,
            scale: robotScale,
            x: "-50%",
            y: "-50%"
          }}
        >
          {/* Dock Effect (Glassmorphism Glow) - HIDDEN ON MOBILE */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-md rounded-full border border-teal-500/20 shadow-2xl -z-10 hidden md:block" />

          <div className="relative z-10 pointer-events-auto w-full h-full scale-[0.8] origin-center"> {/* Internal Scaling tweak to fit dock */}
            <Robot message={robotMessage} state={robotState} isScrollingFast={isScrollingFast} />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
