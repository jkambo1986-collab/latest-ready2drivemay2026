import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView, useSpring } from 'motion/react';
import { Link, scroller, animateScroll } from 'react-scroll';
import { Menu, X, GraduationCap, Phone, ChevronRight, ChevronLeft, Star, ChevronDown, Calendar, Instagram, Facebook, MessageCircle, Music, Youtube, Play, Mail, MapPin, ArrowUp, Check, Send, Banknote, FileText } from 'lucide-react';
import { cn } from './lib/utils';
import { StudyQuiz } from './components/StudyQuiz';

/** Business contact constants + a WhatsApp deep-link helper used across the booking flow. */
const WHATSAPP_NUMBER = '17802358082';
const buildWhatsAppLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

/**
 * Optional free Formspree backend for the contact form (no server required).
 *   1. Sign up at https://formspree.io and create a new form.
 *   2. Copy its endpoint — it looks like  https://formspree.io/f/abcdwxyz
 *   3. Paste it below. Submissions are then emailed straight to the business inbox.
 * Leave it as '' to keep the WhatsApp hand-off instead. If a submission ever fails,
 * the form automatically falls back to WhatsApp so an enquiry is never lost.
 */
const FORMSPREE_ENDPOINT = '';

/**
 * Carries the package a visitor picked on the Fee Schedule into the Booking and
 * Contact sections, so the chosen plan isn't lost between steps.
 */
type BookingContextValue = { selectedPackage: string; setSelectedPackage: (name: string) => void };
const BookingContext = React.createContext<BookingContextValue>({
  selectedPackage: '',
  setSelectedPackage: () => {},
});
const useBooking = () => React.useContext(BookingContext);

/**
 * Image that shows a shimmering skeleton placeholder until the real image
 * has loaded (or fades to a soft fallback on error).
 */
const ImageWithSkeleton: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({ className, alt = '', ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-gray-100", className)}>
      {!loaded && !errored && <div className="absolute inset-0 shimmer" aria-hidden="true" />}
      {errored ? (
        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
          <GraduationCap className="w-8 h-8" />
        </div>
      ) : (
        <img
          {...props}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-700",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </div>
  );
};

/** Thin progress bar at the very top that fills as the page is scrolled. */
const ScrollProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-1 bg-rose-600 origin-left z-[80]"
      aria-hidden="true"
    />
  );
};

/** Number that counts up from 0 to `end` once scrolled into view. */
const CountUp: React.FC<{ end: number; suffix?: string; prefix?: string; duration?: number; className?: string }> = ({
  end,
  suffix = '',
  prefix = '',
  duration = 1.6,
  className,
}) => {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setValue(Math.round(eased * end));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{value}{suffix}
    </span>
  );
};

/** Section ids used to keep the URL hash in sync with the section currently in view. */
const PAGE_SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'services', label: 'Services' },
  { id: 'packages', label: 'Fees' },
  { id: 'booking', label: 'Book' },
  { id: 'training', label: 'Videos' },
  { id: 'study-quiz', label: 'Quiz' },
  { id: 'about', label: 'About' },
  { id: 'testimonials', label: 'Reviews' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact' },
];

/** Content for the Services mega-menu — names & copy taken verbatim from the live site sections. */
const SERVICE_COURSES = [
  { name: 'Class 5 GDL', desc: 'Comprehensive training for new drivers to get their basic license.', pkg: 'Standard GDL' },
  { name: 'Advanced Road Test', desc: 'Preparation for the non-GDL Class 5 road test.', pkg: 'Non-GDL Special' },
  { name: 'Brush-up Lessons', desc: 'Quick sessions to refine your skills before a road test.', pkg: 'Test Ready' },
  { name: 'Insurance Reduction', desc: 'Government approved course to lower your premiums.', pkg: 'Standard GDL' },
];

const SERVICE_EXPLORE = [
  { name: 'Fee Schedule', desc: 'Professional training for every stage.', to: 'packages' },
  { name: 'Training Videos', desc: 'Master your driving skills.', to: 'training' },
  { name: 'Study Modules', desc: 'Start your practice quiz.', to: 'study-quiz' },
  { name: 'Student Success', desc: 'Hear from 5,000+ confident drivers.', to: 'testimonials' },
];

const SERVICE_PREVIEWS = ['cX0I8OdK7Tk', '8wIoR7fpPJM', '1Rdc0q_m2yY'];

const ServicesMenu = () => {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);

  const openNow = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };
  const closeNow = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpen(false);
  };

  return (
    <div onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "flex items-center gap-1 text-sm font-medium transition-colors cursor-pointer",
          open ? "text-rose-600" : "hover:text-rose-500"
        )}
      >
        Services
        <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onMouseEnter={openNow}
            onMouseLeave={closeSoon}
            className="absolute top-full left-1/2 -translate-x-1/2 z-50 w-[min(920px,calc(100vw-3rem))] pt-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl shadow-black/10 border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr_1fr]">
                {/* Left feature panel */}
                <div className="shine shine-soft bg-black text-white p-8 flex flex-col">
                  <span className="text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Our Expertise</span>
                  <h3 className="text-2xl font-black leading-tight mb-3 uppercase tracking-tighter">Master the <span className="text-rose-600 italic">road</span> with confidence</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">We offer a wide range of driving courses designed to make you a safe and confident driver for life.</p>
                  <Link to="services" smooth={true} offset={-80} onClick={closeNow} className="mt-auto inline-flex items-center gap-1 text-rose-500 font-bold text-sm cursor-pointer hover:gap-2 transition-all">
                    View all courses <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Our Expertise */}
                <div className="p-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-5">Our Expertise</p>
                  <div className="space-y-4">
                    {SERVICE_COURSES.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => { goToPackage(c.pkg); closeNow(); }}
                        className="block w-full text-left group"
                      >
                        <p className="font-bold text-sm group-hover:text-rose-600 transition-colors">{c.name}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{c.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Explore */}
                <div className="p-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-5">Explore</p>
                  <div className="space-y-4">
                    {SERVICE_EXPLORE.map((e) => (
                      <Link key={e.to} to={e.to} smooth={true} offset={-80} onClick={closeNow} className="block group cursor-pointer">
                        <p className="font-bold text-sm group-hover:text-rose-600 transition-colors">{e.name}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{e.desc}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* See it live */}
              <div className="bg-gray-50 border-t border-gray-100 px-8 py-5 flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 whitespace-nowrap">See it live</span>
                  <div className="flex gap-3">
                    {SERVICE_PREVIEWS.map((id) => (
                      <Link
                        key={id}
                        to="training"
                        smooth={true}
                        offset={-80}
                        onClick={closeNow}
                        className="block w-24 h-14 rounded-lg overflow-hidden border border-gray-200 hover:border-rose-300 hover:scale-105 transition-all cursor-pointer"
                      >
                        <img src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`} alt="Training video preview" loading="lazy" className="w-full h-full object-cover" />
                      </Link>
                    ))}
                  </div>
                </div>
                <Link to="training" smooth={true} offset={-80} onClick={closeNow} className="inline-flex items-center gap-1 text-rose-600 font-bold text-sm whitespace-nowrap cursor-pointer hover:gap-2 transition-all">
                  Watch training <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Full list — used by the mobile menu (which has no mega-menu).
  const navLinks = [
    { name: 'Home', to: 'home' },
    { name: 'Services', to: 'services' },
    { name: 'Fees', to: 'packages' },
    { name: 'About', to: 'about' },
    { name: 'Reviews', to: 'testimonials' },
    { name: 'Book', to: 'booking' },
    { name: 'Videos', to: 'training' },
    { name: 'Quiz', to: 'study-quiz' },
    { name: 'FAQ', to: 'faq' },
    { name: 'Contact', to: 'contact' },
  ];

  // Trimmed top-level set for desktop — Fees/Reviews/Videos/Quiz live inside the Services mega-menu,
  // and Book has its own CTA button, so they're dropped here to keep the hero uncluttered.
  const desktopLinks = navLinks.filter((l) =>
    ['home', 'services', 'about', 'faq', 'contact'].includes(l.to)
  );

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6",
      isScrolled
        ? "bg-white shadow-lg py-2 border-b border-gray-100"
        : "bg-white/80 backdrop-blur-md py-6"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="home" smooth={true} className="flex items-center gap-2 cursor-pointer group">
          <div className={cn("bg-rose-600 p-1.5 rounded-lg group-hover:rotate-12 transition-all duration-500", isScrolled ? "scale-90" : "scale-100")}>
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className={cn("font-extrabold tracking-tighter uppercase transition-all duration-500", isScrolled ? "text-lg" : "text-xl")}>Ready 2 <span className="text-rose-600">Drive</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-7 lg:gap-9">
          {desktopLinks.map((link) =>
            link.to === 'services' ? (
              <ServicesMenu key={link.to} />
            ) : (
              <Link
                key={link.to}
                to={link.to}
                smooth={true}
                spy={true}
                activeClass="text-rose-600 font-semibold"
                className="text-sm font-medium hover:text-rose-500 transition-colors cursor-pointer"
              >
                {link.name}
              </Link>
            )
          )}
          <Link to="booking" smooth={true} className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-600/25 active:scale-95 transition-all duration-300 cursor-pointer group">
            <Phone className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            Book Now
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 active:scale-90 transition-all"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isMobileMenuOpen ? 'close' : 'open'}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="block"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white border-t border-gray-100 p-6 shadow-xl md:hidden"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={link.to}
                    smooth={true}
                    spy={true}
                    offset={-80}
                    activeClass="text-rose-600 bg-rose-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-lg font-semibold px-4 py-3 rounded-xl hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <Link to="booking" smooth={true} onClick={() => setIsMobileMenuOpen(false)} className="mt-3 flex items-center justify-center gap-2 bg-rose-600 text-white px-5 py-4 rounded-xl font-bold cursor-pointer hover:bg-black active:scale-[0.98] transition-all duration-300">
                <Phone className="w-5 h-5" />
                Call (780) 235-8082
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section 
      id="home"
      ref={containerRef}
      className="relative min-h-screen flex items-center pt-32 md:pt-28 pb-16 overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10">
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          style={{ y: y2 }}
          className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-rose-500/10 rounded-full blur-[100px]" 
        />
      </div>

      <div className="max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          className="min-w-0"
          style={{ opacity }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-800 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            <GraduationCap className="w-3 h-3" />
            Edmonton's Premier Driving School
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-8 break-words">
            MASTER THE <span className="text-shimmer italic">ROAD</span> WITH CONFIDENCE
          </h1>
          <p className="text-lg text-gray-600 max-w-lg mb-10 leading-relaxed">
            Professional driving instruction tailored to your needs. From nervous beginners to advanced brush-ups, we ensure you're road-ready and safe.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="booking" smooth={true} className="shine bg-black text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-rose-600 hover:shadow-xl hover:shadow-rose-600/25 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer">
              Book a Lesson
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="packages" smooth={true} className="bg-white border-2 border-black px-8 py-4 rounded-2xl font-bold text-lg hover:bg-black hover:text-white active:scale-[0.98] transition-all duration-300 flex items-center justify-center cursor-pointer">
              View Fee Schedule
            </Link>
          </div>
          
          <div className="mt-12 flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="User" />
              ))}
            </div>
            <div>
              <div className="flex text-rose-600">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-sm font-medium text-gray-500">Trusted by 5,000+ Students</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          style={{ y: y3, scale }}
          initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="relative"
        >
          <div className="relative z-10 rounded-[40px] overflow-hidden shadow-2xl border-8 border-white">
            <ImageWithSkeleton
              src="https://i.imgur.com/OVolHZ3.jpg"
              alt="Driving Lesson"
              className="w-full aspect-[4/5]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <p className="text-sm font-bold uppercase tracking-widest mb-2 text-rose-400">Check Availability</p>
              <p className="text-lg font-bold leading-snug mb-3">Message us on WhatsApp or call for open slots.</p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={buildWhatsAppLink('Hi Raj, what lesson slots do you have available?')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-[#25D366] text-white text-sm font-bold px-3 py-1.5 rounded-lg hover:bg-[#128C7E] active:scale-95 transition-all"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
                <a
                  href="tel:+17802358082"
                  className="inline-flex items-center gap-1.5 bg-white text-black text-sm font-bold px-3 py-1.5 rounded-lg hover:bg-rose-600 hover:text-white active:scale-95 transition-all"
                >
                  <Phone className="w-4 h-4" /> Call
                </a>
              </div>
            </div>
          </div>
          
          {/* Floating Badge */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="shine absolute -top-6 -right-6 bg-rose-600 text-white p-6 rounded-3xl shadow-xl z-20 hidden md:block"
          >
            <p className="text-4xl font-black leading-none"><CountUp end={98} suffix="%" /></p>
            <p className="text-xs font-bold uppercase tracking-tighter">Pass Rate</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const VideoEmbed: React.FC<{ id: string; title: string }> = ({ id, title }) => {
  // "Facade" pattern: show a lightweight thumbnail and only mount the real
  // YouTube iframe once the user clicks play — keeps the page fast.
  const [playing, setPlaying] = useState(false);
  const [thumbLoaded, setThumbLoaded] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group relative aspect-video rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-rose-600/10 transition-shadow duration-300 bg-gray-900"
    >
      {playing ? (
        <iframe
          src={`https://www.youtube.com/embed/${id}?autoplay=1`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        ></iframe>
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play ${title}`}
          className="absolute inset-0 w-full h-full"
        >
          {!thumbLoaded && (
            <div className="absolute inset-0 shimmer flex items-center justify-center" aria-hidden="true">
              <Youtube className="w-10 h-10 text-gray-300" />
            </div>
          )}
          <img
            src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
            alt={title}
            loading="lazy"
            onLoad={() => setThumbLoaded(true)}
            className={cn(
              "w-full h-full object-cover transition-all duration-500 group-hover:scale-105",
              thumbLoaded ? "opacity-100" : "opacity-0"
            )}
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xl shadow-black/30 group-hover:scale-110 transition-transform duration-300">
              <Play className="w-7 h-7 fill-current ml-1" />
            </div>
          </div>
        </button>
      )}
    </motion.div>
  );
};

const TrainingVideos = () => {
  const videos = [
    { id: "cX0I8OdK7Tk", title: "Training Video 1" },
    { id: "8wIoR7fpPJM", title: "Training Video 2" },
    { id: "1Rdc0q_m2yY", title: "Training Video 3" },
    { id: "8MpfC3mIvhs", title: "Training Video 4" },
    { id: "OPSZMu1-zlM", title: "Training Video 5" },
    { id: "ZaX9Q6nvUK8", title: "Training Video 6" },
    { id: "ypszdIU3Whs", title: "Training Video 7" },
  ];

  const PREVIEW_COUNT = 3;
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? videos : videos.slice(0, PREVIEW_COUNT);
  const hiddenCount = videos.length - PREVIEW_COUNT;

  return (
    <section id="training" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase">Training <span className="text-rose-600">Videos</span></h2>
          <p className="text-gray-500 mt-4">Watch these helpful videos to master your driving skills.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visible.map((video) => (
            <VideoEmbed key={video.id} id={video.id} title={video.title} />
          ))}
        </div>
        {hiddenCount > 0 && (
          <div className="text-center mt-10">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-rose-600 active:scale-95 transition-all duration-300"
            >
              {expanded ? 'Show fewer videos' : `Show ${hiddenCount} more videos`}
              <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", expanded && "rotate-180")} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

/** Stable id slug shared by Services (deep-link source) and Packages (highlight target). */
const pkgSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** Scroll to a specific package card and briefly highlight it. */
const goToPackage = (packageName: string) => {
  const slug = pkgSlug(packageName);
  const el = document.getElementById(`pkg-${slug}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.dispatchEvent(new CustomEvent('r2d:highlight-pkg', { detail: slug }));
  } else {
    document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' });
  }
};

const Services = () => {
  const services = [
    {
      title: "Class 5 GDL",
      desc: "Comprehensive training for new drivers to get their basic license.",
      icon: "🚗",
      color: "bg-blue-50",
      targetPackage: "Standard GDL"
    },
    {
      title: "Advanced Road Test",
      desc: "Preparation for the non-GDL Class 5 road test.",
      icon: "🛣️",
      color: "bg-green-50",
      targetPackage: "Non-GDL Special"
    },
    {
      title: "Brush-up Lessons",
      desc: "Quick sessions to refine your skills before a road test.",
      icon: "✨",
      color: "bg-rose-50",
      targetPackage: "Test Ready"
    },
    {
      title: "Insurance Reduction",
      desc: "Government approved course to lower your premiums.",
      icon: "🛡️",
      color: "bg-purple-50",
      targetPackage: "Standard GDL"
    }
  ];

  return (
    <section id="services" className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 uppercase">Our <span className="text-rose-600">Expertise</span></h2>
          <p className="text-gray-500 max-w-2xl mx-auto">We offer a wide range of driving courses designed to make you a safe and confident driver for life.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <button
                type="button"
                onClick={() => goToPackage(s.targetPackage)}
                className="group flex flex-col h-full w-full text-left p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-rose-600/5 hover:border-rose-200 transition-all duration-300 bg-white cursor-pointer"
              >
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6", s.color)}>
                  {s.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-rose-600 transition-colors duration-300">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                <span className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-rose-600">
                  View pricing
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Packages = () => {
  const { setSelectedPackage } = useBooking();
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    const onHighlight = (e: Event) => {
      setHighlightedId((e as CustomEvent).detail as string);
      window.setTimeout(() => setHighlightedId(null), 2200);
    };
    window.addEventListener('r2d:highlight-pkg', onHighlight);
    return () => window.removeEventListener('r2d:highlight-pkg', onHighlight);
  }, []);

  const packages = [
    {
      name: "Standard GDL",
      price: "$625",
      hours: "10 Hours In-Car",
      features: ["15 Hours Online Course", "City Driving Basics", "Parking Techniques", "Insurance Certificate"],
      popular: true
    },
    {
      name: "Extended GDL",
      price: "$825",
      hours: "14 Hours In-Car",
      features: ["15 Hours Online Course", "Advanced Road Skills", "Highway Driving", "Insurance Certificate"],
      popular: false
    },
    {
      name: "Without Insurance Training",
      price: "$500 + GST",
      hours: "10 Hours In-Car",
      features: ["No Online Course", "Fundamental Skills", "City Driving", "Parking Practice"],
      popular: false
    },
    {
      name: "Non-GDL Special",
      price: "$425",
      hours: "6 Hours In-Car",
      features: ["15 Hours Online Course", "Advanced Road Test Prep", "Insurance Certificate", "Skill Refinement"],
      popular: false
    },
    {
      name: "Test Ready",
      price: "$210",
      hours: "2 Hours Brush-up",
      features: ["Car Rental for Test", "Pre-test Warmup", "Route Familiarization", "Confidence Building"],
      popular: false
    },
    {
      name: "Hourly Lesson",
      price: "$55",
      hours: "1 Hour Session",
      features: ["No Certificate", "Flexible Scheduling", "Targeted Practice", "Pay-as-you-go"],
      popular: false
    }
  ];

  return (
    <section id="packages" className="py-12">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
        >
          <div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase">Fee <span className="text-rose-600">Schedule</span></h2>
            <p className="text-gray-500 mt-4">All prices are subject to GST. Professional training for every stage.</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((p, i) => (
            <motion.div
              key={i}
              id={`pkg-${pkgSlug(p.name)}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              whileHover={{ y: -8 }}
              className={cn(
                "relative p-10 rounded-[40px] border-2 scroll-mt-28 transition-all duration-300",
                p.popular
                  ? "border-rose-600 bg-black text-white shadow-2xl hover:shadow-rose-600/30"
                  : "border-gray-100 bg-white hover:shadow-2xl hover:shadow-rose-600/5 hover:border-rose-200",
                highlightedId === pkgSlug(p.name) && "ring-4 ring-rose-500 ring-offset-4 shadow-2xl shadow-rose-600/40 scale-[1.02]"
              )}
            >
              {p.popular && (
                <motion.div
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-600/40"
                >
                  Best Value
                </motion.div>
              )}
              <div className="mb-8">
                <h3 className="text-2xl font-black mb-2">{p.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black">{p.price}</span>
                  <span className={cn("text-sm font-medium", p.popular ? "text-gray-400" : "text-gray-500")}>+ GST</span>
                </div>
                <p className={cn("mt-2 font-bold", p.popular ? "text-rose-600" : "text-rose-600")}>{p.hours}</p>
              </div>

              <ul className="space-y-4 mb-10">
                {p.features.map((f, fi) => (
                  <li key={fi} className="flex items-center gap-3 text-sm">
                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center", p.popular ? "bg-rose-600 text-white" : "bg-black text-white")}>
                      <Star className="w-3 h-3 fill-current" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="booking"
                smooth={true}
                offset={-80}
                onClick={() => setSelectedPackage(p.name)}
                className={cn(
                  "w-full py-4 rounded-2xl font-bold transition-all duration-300 text-center block cursor-pointer active:scale-[0.98]",
                  p.popular
                    ? "bg-rose-600 text-white hover:bg-white hover:text-black hover:shadow-lg"
                    : "bg-black text-white hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-600/25"
                )}
              >
                Book Now
              </Link>
            </motion.div>
          ))}
          
          {/* Car Rental Add-on */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.45 }}
            whileHover={{ y: -8 }}
            className="group p-10 rounded-[40px] border-2 border-dashed border-gray-200 bg-gray-50 hover:border-rose-300 hover:bg-rose-50/30 transition-colors duration-300 flex flex-col justify-center items-center text-center"
          >
            <h3 className="text-2xl font-black mb-2">Car Rental</h3>
            <p className="text-4xl font-black mb-4">$100 <span className="text-sm text-gray-400">+ GST</span></p>
            <p className="text-sm text-gray-500 font-medium">Available for road tests. Professional, clean, and test-ready vehicle.</p>
          </motion.div>
        </div>

        {/* Mode of Payment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 flex flex-col md:flex-row md:items-center gap-6 rounded-[32px] border-2 border-gray-100 bg-white p-8"
        >
          <span className="text-rose-600 text-[10px] font-black uppercase tracking-[0.2em] shrink-0">Mode of Payment</span>
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'E-Transfer', icon: Send },
              { label: 'Cash', icon: Banknote },
              { label: 'Cheque', icon: FileText },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-2 rounded-2xl bg-gray-50 border border-gray-100 px-5 py-3 font-bold text-sm">
                <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center">
                  <m.icon className="w-4 h-4" />
                </div>
                {m.label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/**
 * Free Google Calendar booking.
 *
 * To enable live, self-serve time-slot booking:
 *   1. Open Google Calendar (the business Google account) → "Create" → "Appointment schedule".
 *   2. Set availability, lesson duration, location, etc. and Save.
 *   3. Click "Share" → "Embed" and copy the URL inside the iframe src
 *      (it looks like https://calendar.google.com/calendar/appointments/schedules/XXXX?gv=true).
 *   4. Paste that URL below.
 *
 * Leave it as an empty string to keep showing the WhatsApp / Call fallback only.
 * This is 100% free — no backend, no paid plan required.
 */
const GOOGLE_BOOKING_URL = '';

const Booking = () => {
  const hasCalendar = GOOGLE_BOOKING_URL.trim().length > 0;
  const { selectedPackage } = useBooking();
  const waMessage = selectedPackage
    ? `Hi Raj, I'd like to book the ${selectedPackage} package. When is your next availability?`
    : "Hi Raj, I'd like to book a driving lesson. When is your next availability?";

  return (
    <section id="booking" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase">Book Your <span className="text-rose-600">Lesson</span></h2>
          <p className="text-gray-500 mt-4">Select a time that works for you and start your journey today.</p>
        </motion.div>

        {hasCalendar && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="w-full max-w-4xl mx-auto mb-12 rounded-[40px] overflow-hidden border border-gray-100 shadow-lg bg-white"
          >
            <div className="flex items-center gap-2 px-6 py-4 bg-gray-50 border-b border-gray-100">
              <Calendar className="w-5 h-5 text-rose-600" />
              <span className="font-bold text-sm uppercase tracking-widest text-gray-600">Live Availability</span>
            </div>
            <iframe
              src={GOOGLE_BOOKING_URL}
              title="Book a driving lesson"
              className="w-full h-[600px] border-0"
              loading="lazy"
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-2xl mx-auto bg-gray-50 rounded-[40px] p-12 border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 text-center"
        >
          {selectedPackage && (
            <div className="mb-6 inline-flex items-center gap-2 bg-rose-100 text-rose-700 px-4 py-2 rounded-full text-sm font-bold">
              <Calendar className="w-4 h-4" />
              Selected plan: {selectedPackage}
            </div>
          )}
          <h3 className="text-2xl font-bold mb-8">
            {hasCalendar ? 'Prefer to talk to us first?' : 'Ready to start your driving journey?'}
          </h3>
          <p className="text-gray-600 mb-10">
            {hasCalendar
              ? "Pick a slot above, or reach us directly — we're available for calls and messages."
              : 'Contact us directly to schedule your lessons. We\'re available for calls and messages.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a
              href={buildWhatsAppLink(waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#128C7E] hover:shadow-xl hover:shadow-[#25D366]/30 active:scale-[0.98] transition-all duration-300 group"
            >
              <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
              Book via WhatsApp
            </a>
            <a
              href="tel:+17802358082"
              className="flex items-center justify-center gap-3 bg-black text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-rose-600 hover:shadow-xl hover:shadow-rose-600/25 active:scale-[0.98] transition-all duration-300 group"
            >
              <Phone className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              Call Us Now
            </a>
          </div>
        </motion.div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400 font-medium italic">
            Can't find a suitable time? <Link to="contact" smooth={true} className="text-rose-600 font-bold cursor-pointer hover:underline">Contact us</Link> directly.
          </p>
        </div>
      </div>
    </section>
  );
};

const About = () => {
  const instructors = [
    {
      name: "Raj Mangat",
      role: "Lead Instructor & Owner",
      bio: "With over 15 years of professional driving instruction experience in Edmonton, Raj is known for his calm demeanor and exceptional pass rates. He specializes in nervous beginners and advanced road test preparation.",
      image: "/raj.png"
    }
  ];

  const fallbackAvatar = (name: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=320&background=e11d48&color=ffffff&bold=true&font-size=0.4`;

  return (
    <section id="about" className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase mb-6">
              Edmonton's Most <span className="text-rose-600">Trusted</span> Academy
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              At Ready 2 Drive, we believe that learning to drive is a milestone that deserves professional, patient, and personalized attention. Our mission is to transform nervous students into confident, safe, and responsible drivers.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-4xl font-black text-rose-600 mb-1"><CountUp end={15} suffix="+" /></p>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Years Experience</p>
              </div>
              <div>
                <p className="text-4xl font-black text-rose-600 mb-1"><CountUp end={5} suffix="k+" /></p>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Happy Students</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-video rounded-[40px] overflow-hidden shadow-2xl border-8 border-white">
              <ImageWithSkeleton
                src="https://i.imgur.com/HLPN225.jpg"
                alt="Driving School Office"
                className="w-full h-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl hidden md:block">
              <p className="text-rose-600 font-black text-xl italic">"Safety First, Always."</p>
            </div>
          </motion.div>
        </div>

        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-black tracking-tight uppercase">Meet Our <span className="text-rose-600">Instructors</span></h3>
          <p className="text-gray-500 mt-4">Learn from the best in the industry.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {instructors.map((instructor, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              whileHover={{ y: -6 }}
              className="group bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-rose-600/5 hover:border-rose-100 transition-all duration-300 flex flex-col md:flex-row gap-8 items-center md:items-start"
            >
              <img
                src={instructor.image}
                alt={instructor.name}
                className="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover shadow-lg transition-transform duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackAvatar(instructor.name); }}
              />
              <div className="text-center md:text-left">
                <h4 className="text-2xl font-black mb-1">{instructor.name}</h4>
                <p className="text-rose-600 font-bold text-sm uppercase tracking-widest mb-4">{instructor.role}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{instructor.bio}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

type Review = {
  name: string;
  role: string;
  quote: string;
  image: string;
  rating?: number;
};

const REVIEWS_STORAGE_KEY = 'r2d_reviews';

const Testimonials = () => {
  const defaultTestimonials: Review[] = [
    {
      name: "HarmanKaur",
      role: "Class 5 GDL Student",
      quote: "I was so nervous about driving, but my instructor at Ready 2 Drive was incredibly patient. I passed my road test on the first try! Highly recommend the Standard GDL package.",
      image: "https://i.imgur.com/OLr8WLa.jpg"
    },
    {
      name: "Manraj Singh",
      role: "Advanced Road Test",
      quote: "The brush-up lessons were exactly what I needed. They pointed out small habits I didn't even know I had. Professional, punctual, and very knowledgeable about Edmonton routes.",
      image: "https://i.imgur.com/l07Ia2y.jpg"
    },
    {
      name: "Amanpreet Singh",
      role: "Insurance Reduction Course",
      quote: "The online course was easy to follow and the in-car training was top-notch. Not only did I get my certificate, but I feel much safer on the road now. Best driving school in the city!",
      image: "https://i.imgur.com/tS2CNxq.jpg"
    },
    {
      name: "David Wilson",
      role: "New Driver",
      quote: "Ready 2 Drive made the whole process so simple. My instructor was great at explaining complex rules in a way that was easy to understand. I feel very confident now.",
      image: "https://i.imgur.com/WrWUPKZ.jpg"
    },
    {
      name: "Elena Rodriguez",
      role: "Brush-up Lessons",
      quote: "After not driving for years, I was terrified to get back behind the wheel. Ready 2 Drive helped me regain my confidence in just a few sessions. Thank you!",
      image: "https://i.pravatar.cc/150?u=elena"
    }
  ];

  const [testimonials, setTestimonials] = useState<Review[]>(defaultTestimonials);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Load any visitor-submitted reviews and show them first.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(REVIEWS_STORAGE_KEY) || '[]');
      if (Array.isArray(saved) && saved.length) {
        setTestimonials([...saved, ...defaultTestimonials]);
      }
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  const handleAddReview = (review: Review) => {
    try {
      const saved = JSON.parse(localStorage.getItem(REVIEWS_STORAGE_KEY) || '[]');
      const next = Array.isArray(saved) ? [review, ...saved] : [review];
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage may be unavailable; still show it this session */
    }
    setTestimonials(prev => [review, ...prev]);
    setDirection(-1);
    setCurrentIndex(0);
    setShowReviewForm(false);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextTestimonial();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const nextTestimonial = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <section id="testimonials" className="py-12 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase">Student <span className="text-rose-600">Success</span></h2>
          <p className="text-gray-500 mt-4">Hear from some of our 5,000+ confident drivers who mastered the road with us.</p>
          <button
            onClick={() => setShowReviewForm(true)}
            className="mt-8 inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-600/25 active:scale-95 transition-all duration-300 group"
          >
            <Star className="w-4 h-4 fill-current group-hover:rotate-[72deg] transition-transform duration-300" />
            Write a Review
          </button>
        </motion.div>

        <div className="relative max-w-4xl mx-auto h-[400px] md:h-[300px]">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute w-full"
            >
              <div className="bg-gray-50 p-8 md:p-12 rounded-[40px] border border-gray-100 shadow-sm relative group">
                <div className="absolute top-8 right-8 text-rose-100">
                  <Star className="w-16 h-16 fill-current opacity-20" />
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <ImageWithSkeleton
                    key={testimonials[currentIndex].image}
                    src={testimonials[currentIndex].image}
                    alt={testimonials[currentIndex].name}
                    className="w-24 h-24 rounded-3xl border-4 border-white shadow-lg flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex justify-center md:justify-start text-rose-600 mb-4">
                      {[1,2,3,4,5].map(star => (
                        <Star
                          key={star}
                          className={cn(
                            "w-5 h-5",
                            star <= (testimonials[currentIndex].rating ?? 5)
                              ? "fill-current"
                              : "fill-none text-gray-300"
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-xl md:text-2xl text-gray-700 leading-relaxed italic mb-6">
                      "{testimonials[currentIndex].quote}"
                    </p>
                    <div>
                      <h4 className="font-bold text-xl">{testimonials[currentIndex].name}</h4>
                      <p className="text-sm font-bold text-rose-600 uppercase tracking-widest">
                        {testimonials[currentIndex].role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-16 z-10">
            <button
              onClick={prevTestimonial}
              aria-label="Previous review"
              className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400 hover:text-rose-600 hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-16 z-10">
            <button
              onClick={nextTestimonial}
              aria-label="Next review"
              className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400 hover:text-rose-600 hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Dots Navigation */}
        <div className="flex justify-center gap-3 mt-12">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
              }}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                currentIndex === i ? "w-8 bg-rose-600" : "w-2 bg-gray-200 hover:bg-rose-200"
              )}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showReviewForm && (
          <ReviewModal onClose={() => setShowReviewForm(false)} onSubmit={handleAddReview} />
        )}
      </AnimatePresence>
    </section>
  );
};

const ReviewModal: React.FC<{ onClose: () => void; onSubmit: (review: Review) => void }> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [quote, setQuote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPosting, setIsPosting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = 'Your name is required';
    } else if (/\d/.test(trimmedName)) {
      newErrors.name = 'Name cannot contain numbers';
    } else if (!/^[A-Za-z][A-Za-z .'-]*[A-Za-z]$/.test(trimmedName)) {
      newErrors.name = 'Please enter a valid name';
    }
    if (quote.trim().length < 10) {
      newErrors.quote = 'Please share a little more (10+ characters)';
    }
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    // Brief loading state so posting feels responsive
    setIsPosting(true);
    setTimeout(() => {
      onSubmit({
        name: trimmedName,
        role: 'Verified Student',
        quote: quote.trim(),
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmedName)}&background=e11d48&color=fff&bold=true`,
        rating,
      });
    }, 700);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white text-black w-full max-w-lg rounded-[32px] p-8 md:p-10 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-rose-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2">Share Your <span className="text-rose-600">Experience</span></h3>
        <p className="text-gray-500 text-sm mb-8">Tell other learners how your lessons went.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.replace(/[^A-Za-z .'-]/g, ''))}
              className={cn(
                "w-full bg-gray-50 border rounded-xl p-4 outline-none transition-all duration-200 hover:bg-gray-100 focus:bg-white focus:ring-4",
                errors.name
                  ? "border-red-500 ring-4 ring-red-500/10"
                  : "border-transparent focus:border-rose-600 focus:ring-rose-600/10"
              )}
              placeholder="Enter your name"
            />
            {errors.name && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Your Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`${star} star${star > 1 ? 's' : ''}`}
                  className="text-rose-600 hover:scale-125 active:scale-110 transition-transform duration-150"
                >
                  <Star className={cn("w-8 h-8 transition-colors", star <= (hoverRating || rating) ? "fill-current" : "fill-none text-gray-300")} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Your Review</label>
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              className={cn(
                "w-full bg-gray-50 border rounded-xl p-4 h-28 outline-none resize-none transition-all duration-200 hover:bg-gray-100 focus:bg-white focus:ring-4",
                errors.quote
                  ? "border-red-500 ring-4 ring-red-500/10"
                  : "border-transparent focus:border-rose-600 focus:ring-rose-600/10"
              )}
              placeholder="How was your experience with Ready 2 Drive?"
            />
            {errors.quote && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{errors.quote}</p>}
          </div>

          <button
            type="submit"
            disabled={isPosting}
            className={cn(
              "w-full bg-black text-white py-4 rounded-2xl font-black text-lg transition-all duration-300 flex items-center justify-center gap-2 hover:bg-rose-600 hover:shadow-xl hover:shadow-rose-600/25 active:scale-[0.98]",
              isPosting && "opacity-70 cursor-not-allowed hover:shadow-none active:scale-100"
            )}
          >
            {isPosting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                Posting...
              </>
            ) : "Post Review"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

const FAQ = () => {
  const faqs = [
    {
      question: "What do I need to bring for my first lesson?",
      answer: "You must bring your valid Alberta Class 7 (Learner's) or Class 5 GDL license. We cannot conduct the lesson without seeing your physical license first."
    },
    {
      question: "Do you offer pickup and drop-off services?",
      answer: "Yes! We provide free pickup and drop-off within the Edmonton city limits for all our in-car driving lessons."
    },
    {
      question: "How long is each driving lesson?",
      answer: "Standard lessons are 2 hours long. This allows enough time for a thorough review of previous skills and the introduction of new maneuvers without causing driver fatigue."
    },
    {
      question: "Can I use the school's car for my road test?",
      answer: "Absolutely. You can book our 'Test Ready' package which includes a 2-hour brush-up and the car rental, or add car rental to any other package for $100 + GST."
    },
    {
      question: "What is your cancellation policy?",
      answer: "We require at least 24 hours' notice for any lesson cancellations or rescheduling. Cancellations with less than 24 hours' notice may be subject to a fee."
    },
    {
      question: "Is the 15-hour online course mandatory?",
      answer: "The online course is required if you wish to receive the Government of Alberta Insurance Reduction Certificate. It's highly recommended for all new drivers to build a strong theoretical foundation."
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase">Common <span className="text-rose-600">Questions</span></h2>
          <p className="text-gray-500 mt-4">Everything you need to know about starting your journey with Ready 2 Drive.</p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={cn(
                "bg-white rounded-3xl border overflow-hidden shadow-sm transition-colors duration-300",
                openIndex === i ? "border-rose-200 shadow-md" : "border-gray-100 hover:border-rose-100"
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors group"
              >
                <span className="font-bold text-lg pr-8 group-hover:text-rose-600 transition-colors">{faq.question}</span>
                <ChevronDown className={cn("w-5 h-5 text-rose-600 transition-transform duration-300 flex-shrink-0", openIndex === i && "rotate-180")} />
              </button>
              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ 
                      height: "auto", 
                      opacity: 1,
                      transition: {
                        height: {
                          duration: 0.4,
                          ease: [0.04, 0.62, 0.23, 0.98]
                        },
                        opacity: {
                          duration: 0.25,
                          delay: 0.1
                        }
                      }
                    }}
                    exit={{ 
                      height: 0, 
                      opacity: 0,
                      transition: {
                        height: {
                          duration: 0.3,
                          ease: [0.04, 0.62, 0.23, 0.98]
                        },
                        opacity: {
                          duration: 0.2
                        }
                      }
                    }}
                  >
                    <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-50">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/** Rich service options for the contact dropdown — label + description + icon, like a mini mega-menu. */
const SERVICE_OPTIONS = [
  { value: 'Class 5 GDL Training', desc: 'Full beginner program + insurance certificate', icon: '🚗' },
  { value: 'Insurance Reduction Course', desc: 'Government-approved course to lower premiums', icon: '🛡️' },
  { value: 'Brush-up Lessons', desc: 'Refine your skills before the road test', icon: '✨' },
  { value: 'Advanced Road Test Prep', desc: 'Non-GDL Class 5 road test preparation', icon: '🛣️' },
  { value: 'Car Rental for Road Test', desc: 'Clean, test-ready vehicle for your exam', icon: '🔑' },
  { value: 'Other', desc: "Something else? Tell us in the message", icon: '💬' },
];

/** Custom service picker: tappable panel + full keyboard support (arrows / Home / End / Enter / Esc). */
const ServiceDropdown: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const selectedIndex = SERVICE_OPTIONS.findIndex(o => o.value === value);
  const selected = SERVICE_OPTIONS[selectedIndex] ?? SERVICE_OPTIONS[0];

  const openMenu = () => {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };
  const closeMenu = () => {
    setOpen(false);
    setActiveIndex(-1);
  };
  const choose = (i: number) => {
    onChange(SERVICE_OPTIONS[i].value);
    closeMenu();
  };

  // Close on outside click.
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) closeMenu();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  // Keep the highlighted option scrolled into view as the user arrows through.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const opts = listRef.current?.querySelectorAll('[role="option"]');
    (opts?.[activeIndex] as HTMLElement | undefined)?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setActiveIndex(i => (i + 1) % SERVICE_OPTIONS.length); break;
      case 'ArrowUp': e.preventDefault(); setActiveIndex(i => (i - 1 + SERVICE_OPTIONS.length) % SERVICE_OPTIONS.length); break;
      case 'Home': e.preventDefault(); setActiveIndex(0); break;
      case 'End': e.preventDefault(); setActiveIndex(SERVICE_OPTIONS.length - 1); break;
      case 'Enter':
      case ' ': e.preventDefault(); if (activeIndex >= 0) choose(activeIndex); break;
      case 'Escape': e.preventDefault(); closeMenu(); break;
      case 'Tab': closeMenu(); break;
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-activedescendant={open && activeIndex >= 0 ? `service-opt-${activeIndex}` : undefined}
        className="w-full flex items-center justify-between gap-3 bg-gray-50 border border-transparent rounded-xl p-4 text-left outline-none cursor-pointer transition-all duration-200 hover:bg-gray-100 focus:bg-white focus:border-rose-600 focus:ring-4 focus:ring-rose-600/10"
      >
        <span className="flex items-center gap-3 min-w-0">
          <span className="text-xl leading-none flex-shrink-0">{selected.icon}</span>
          <span className="min-w-0">
            <span className="block font-bold truncate">{selected.value}</span>
            <span className="block text-xs text-gray-500 truncate">{selected.desc}</span>
          </span>
        </span>
        <ChevronDown className={cn("w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            role="listbox"
            aria-label="Service interested in"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute z-30 mt-2 w-full max-h-[18rem] overflow-auto bg-white border border-gray-100 rounded-2xl shadow-2xl p-2"
          >
            {SERVICE_OPTIONS.map((o, i) => {
              const isSelected = o.value === value;
              const isActive = i === activeIndex;
              return (
                <li key={o.value} id={`service-opt-${i}`} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => choose(i)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors",
                      isActive ? "bg-rose-50 ring-1 ring-rose-200" : isSelected ? "bg-rose-50" : "hover:bg-gray-50"
                    )}
                  >
                    <span className="text-xl leading-none mt-0.5 flex-shrink-0">{o.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className={cn("block font-bold text-sm", (isSelected || isActive) && "text-rose-600")}>{o.value}</span>
                      <span className="block text-xs text-gray-500">{o.desc}</span>
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

const Contact = () => {
  const { selectedPackage } = useBooking();
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    service: 'Class 5 GDL Training',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Carry a package chosen on the Fee Schedule into the message (only if the user hasn't typed one).
  useEffect(() => {
    if (!selectedPackage) return;
    setFormData(prev => (prev.message.trim() ? prev : { ...prev, message: `I'm interested in the ${selectedPackage} package.` }));
  }, [selectedPackage]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Name: required, letters only (allow spaces, hyphens, apostrophes, periods), no digits
    const name = formData.fullName.trim();
    if (!name) {
      newErrors.fullName = 'Full name is required';
    } else if (name.length < 2) {
      newErrors.fullName = 'Please enter your full name';
    } else if (/\d/.test(name)) {
      newErrors.fullName = 'Name cannot contain numbers';
    } else if (!/^[A-Za-z][A-Za-z .'-]*[A-Za-z]$/.test(name)) {
      newErrors.fullName = 'Please enter a valid name';
    }

    // Phone: required, 10–15 digits, not all the same digit (rejects 000…)
    const digits = formData.phoneNumber.replace(/\D/g, '');
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (digits.length < 10 || digits.length > 15) {
      newErrors.phoneNumber = 'Enter a valid phone number (at least 10 digits)';
    } else if (/^(\d)\1+$/.test(digits)) {
      newErrors.phoneNumber = 'Please enter a real phone number';
    }

    if (!formData.message.trim()) newErrors.message = 'Message is required';
    return newErrors;
  };

  const showSuccess = () => {
    setIsSubmitting(false);
    setIsSuccess(true);
    setFormData({ fullName: '', phoneNumber: '', service: 'Class 5 GDL Training', message: '' });
    setTimeout(() => setIsSuccess(false), 8000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    const enquiry = [
      'New enquiry from the Ready 2 Drive website:',
      `Name: ${formData.fullName}`,
      `Phone: ${formData.phoneNumber}`,
      `Service: ${formData.service}`,
      `Message: ${formData.message}`,
    ].join('\n');

    // Path A — Formspree configured: deliver silently by email.
    if (FORMSPREE_ENDPOINT) {
      setIsSubmitting(true);
      try {
        const res = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            name: formData.fullName,
            phone: formData.phoneNumber,
            service: formData.service,
            message: formData.message,
            _subject: `New lesson enquiry — ${formData.service}`,
          }),
        });
        if (!res.ok) throw new Error('Formspree request failed');
        showSuccess();
      } catch {
        // Endpoint/network failure — never lose the lead: fall back to WhatsApp (same tab is reliable).
        setIsSubmitting(false);
        window.location.href = buildWhatsAppLink(enquiry);
      }
      return;
    }

    // Path B — no backend: open WhatsApp inside the click gesture so the popup isn't blocked.
    const opened = window.open(buildWhatsAppLink(enquiry), '_blank', 'noopener,noreferrer');
    if (!opened) {
      window.location.href = buildWhatsAppLink(enquiry);
      return;
    }
    setIsSubmitting(true);
    setTimeout(showSuccess, 600);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    let { value } = e.target;

    // Live-sanitize: keep names letter-based, keep phone numeric-friendly
    if (name === 'fullName') {
      value = value.replace(/[^A-Za-z .'-]/g, '');
    } else if (name === 'phoneNumber') {
      value = value.replace(/[^\d+\s().-]/g, '');
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <section id="contact" className="py-12 bg-black text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-rose-600/5 -skew-x-12 translate-x-1/4" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-none">
              READY TO <br />
              <span className="text-rose-600">START?</span>
            </h2>
            <p className="text-gray-400 text-lg mb-12 max-w-md">
              Have questions about our courses or scheduling? Send us a message and our team will get back to you within 2 hours.
            </p>
            
            <div className="space-y-8">
              <a href="tel:+17802358082" className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-rose-600/20 transition-colors">
                  <Phone className="text-rose-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Call Us</p>
                  <p className="text-xl font-bold group-hover:text-rose-400 transition-colors">(780) 235-8082</p>
                </div>
              </a>
              <a
                href="https://maps.google.com/?q=1503+12+ST+NW+Edmonton+AB+T6T+2V2"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-6 group"
              >
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-rose-600/20 transition-colors">
                  <MapPin className="text-rose-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Office</p>
                  <p className="text-lg sm:text-xl font-bold break-words group-hover:text-rose-400 transition-colors">1503, 12 ST. NW, Edmonton, AB T6T 2V2</p>
                </div>
              </a>
              <a href="mailto:rajmangat121@gmail.com" className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-rose-600/20 transition-colors">
                  <Mail className="text-rose-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Email</p>
                  <p className="text-lg sm:text-xl font-bold break-all group-hover:text-rose-400 transition-colors">rajmangat121@gmail.com</p>
                </div>
              </a>
            </div>

            {/* WhatsApp QR — scan on desktop, tap on mobile */}
            <div className="mt-10 flex items-center gap-5 rounded-3xl bg-white/5 border border-white/10 p-5">
              <div className="bg-white p-2 rounded-2xl flex-shrink-0">
                <img
                  src="/whatsapp-qr.png"
                  alt="Scan to chat with Ready 2 Drive on WhatsApp"
                  width={112}
                  height={112}
                  loading="lazy"
                  className="w-28 h-28 block"
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-1">WhatsApp</p>
                <p className="text-lg font-bold mb-3 leading-tight">Scan to chat with us</p>
                <a
                  href="https://wa.me/qr/3VC6C2RVJN72F1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors active:scale-[0.98]"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white text-black p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] shadow-2xl"
          >
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10" strokeWidth={3} />
                  </div>
                  <h3 className="text-3xl font-black mb-4 uppercase">{FORMSPREE_ENDPOINT ? 'Message Sent!' : 'Almost there!'}</h3>
                  {FORMSPREE_ENDPOINT ? (
                    <p className="text-gray-500">Thank you for reaching out — we'll get back to you within 2 hours. Prefer to talk now? <a href="tel:+17802358082" className="text-rose-600 font-bold hover:underline">(780) 235-8082</a></p>
                  ) : (
                    <p className="text-gray-500">We've opened WhatsApp with your message ready to send — just tap send and we'll reply within 2 hours. Prefer email? <a href="mailto:rajmangat121@gmail.com" className="text-rose-600 font-bold hover:underline">rajmangat121@gmail.com</a></p>
                  )}
                </motion.div>
              ) : (
                <form key="form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        autoComplete="name"
                        className={cn(
                          "w-full bg-gray-50 border rounded-xl p-4 outline-none transition-all duration-200 hover:bg-gray-100 focus:bg-white focus:ring-4",
                          errors.fullName
                            ? "border-red-500 ring-4 ring-red-500/10"
                            : "border-transparent focus:border-rose-600 focus:ring-rose-600/10"
                        )}
                        placeholder="Enter your full name here"
                      />
                      {errors.fullName && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{errors.fullName}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Phone Number</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        inputMode="tel"
                        autoComplete="tel"
                        className={cn(
                          "w-full bg-gray-50 border rounded-xl p-4 outline-none transition-all duration-200 hover:bg-gray-100 focus:bg-white focus:ring-4",
                          errors.phoneNumber
                            ? "border-red-500 ring-4 ring-red-500/10"
                            : "border-transparent focus:border-rose-600 focus:ring-rose-600/10"
                        )}
                        placeholder="We'll call you back soon"
                      />
                      {errors.phoneNumber && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{errors.phoneNumber}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Service Interested In</label>
                    <ServiceDropdown
                      value={formData.service}
                      onChange={(v) => setFormData(prev => ({ ...prev, service: v }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className={cn(
                        "w-full bg-gray-50 border rounded-xl p-4 h-32 outline-none resize-none transition-all duration-200 hover:bg-gray-100 focus:bg-white focus:ring-4",
                        errors.message
                          ? "border-red-500 ring-4 ring-red-500/10"
                          : "border-transparent focus:border-rose-600 focus:ring-rose-600/10"
                      )}
                      placeholder="How can we help you master the road?"
                    ></textarea>
                    {errors.message && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{errors.message}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      "w-full bg-black text-white py-5 rounded-2xl font-black text-lg transition-all duration-300 flex items-center justify-center gap-2 hover:bg-rose-600 hover:shadow-xl hover:shadow-rose-600/25 active:scale-[0.98]",
                      isSubmitting && "opacity-70 cursor-not-allowed hover:shadow-none active:scale-100"
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Sending...
                      </>
                    ) : "Send Message"}
                  </button>
                </form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const SocialLink: React.FC<{ social: { name: string, icon: any, href: string } }> = ({ social }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative">
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-lg whitespace-nowrap pointer-events-none z-50"
          >
            Visit our {social.name}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
      <a 
        href={social.href} 
        target="_blank" 
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-rose-600 hover:bg-rose-50 hover:-translate-y-1 hover:shadow-md active:scale-90 transition-all duration-300"
        aria-label={social.name}
      >
        <social.icon className="w-5 h-5" />
      </a>
    </div>
  );
};

const FOOTER_SOCIALS = [
  { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/ready2driv.e?igsh=MWx2c3ZlMXhoNjk0dQ%3D%3D' },
  { name: 'Facebook', icon: Facebook, href: 'https://www.facebook.com/profile.php?id=61588801644776' },
  { name: 'TikTok', icon: Music, href: 'https://www.tiktok.com/@ready2drive4?_r=1&_t=ZS-95vk5EujQs1' },
  { name: 'YouTube', icon: Youtube, href: 'https://www.youtube.com/@ready2drive-z1h' },
];

const FOOTER_EXPLORE = [
  { name: 'Services', to: 'services' },
  { name: 'Fee Schedule', to: 'packages' },
  { name: 'Book a Lesson', to: 'booking' },
  { name: 'Training Videos', to: 'training' },
  { name: 'Practice Quiz', to: 'study-quiz' },
];

const FOOTER_COMPANY = [
  { name: 'About Us', to: 'about' },
  { name: 'Reviews', to: 'testimonials' },
  { name: 'FAQ', to: 'faq' },
  { name: 'Contact', to: 'contact' },
];

const Footer = () => {
  return (
    <footer className="border-t border-gray-100 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* Brand + socials */}
          <div>
            <Link to="home" smooth={true} className="flex items-center gap-2 cursor-pointer group mb-4">
              <div className="bg-rose-600 p-1 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg tracking-tighter uppercase">Ready 2 <span className="text-rose-600">Drive</span></span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Edmonton's premier driving school — Class 5 GDL, insurance reduction, and brush-up lessons with a 98% pass rate.
            </p>
            <div className="flex gap-4 mt-6">
              {FOOTER_SOCIALS.map(social => (
                <SocialLink key={social.name} social={social} />
              ))}
            </div>
          </div>

          {/* Explore */}
          <nav aria-label="Explore">
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-5">Explore</h4>
            <ul className="space-y-3">
              {FOOTER_EXPLORE.map(l => (
                <li key={l.to}>
                  <Link to={l.to} smooth={true} offset={-80} className="text-sm font-medium text-gray-600 hover:text-rose-600 transition-colors cursor-pointer">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company">
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-5">Company</h4>
            <ul className="space-y-3">
              {FOOTER_COMPANY.map(l => (
                <li key={l.to}>
                  <Link to={l.to} smooth={true} offset={-80} className="text-sm font-medium text-gray-600 hover:text-rose-600 transition-colors cursor-pointer">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-5">Get in touch</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <a href="tel:+17802358082" className="flex items-center gap-3 text-gray-600 hover:text-rose-600 transition-colors">
                  <Phone className="w-4 h-4 text-rose-600 flex-shrink-0" /> (780) 235-8082
                </a>
              </li>
              <li>
                <a href="mailto:rajmangat121@gmail.com" className="flex items-center gap-3 text-gray-600 hover:text-rose-600 transition-colors break-all">
                  <Mail className="w-4 h-4 text-rose-600 flex-shrink-0" /> rajmangat121@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://maps.google.com/?q=1503+12+ST+NW+Edmonton+AB+T6T+2V2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-gray-600 hover:text-rose-600 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" /> 1503, 12 ST. NW, Edmonton, AB T6T 2V2
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400 font-medium">© {new Date().getFullYear()} Ready 2 Drive Driving School. All rights reserved.</p>
          <p className="text-xs text-gray-400">Made with care in Edmonton, Alberta 🇨🇦</p>
        </div>
      </div>
    </footer>
  );
};

const FloatingBookingButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-8 right-8 z-50 hidden md:block"
        >
          <Link
            to="booking"
            smooth={true}
            offset={-100}
            duration={800}
            className="flex items-center gap-3 bg-rose-600 text-white px-6 py-4 rounded-full font-black shadow-2xl shadow-rose-600/30 hover:bg-black transition-colors duration-300 cursor-pointer group"
          >
            <Calendar className="w-6 h-6" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap">
              Book Lesson
            </span>
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-black rounded-full flex items-center justify-center animate-bounce">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const InAppBrowserBanner = () => {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || '';
    // Facebook / Instagram / Messenger / other social in-app browsers
    const isInApp = /FBAN|FBAV|FB_IAB|Instagram|Messenger|Line\/|Twitter|TikTok/i.test(ua);
    if (isInApp && !sessionStorage.getItem('r2d_dismissed_inapp')) {
      setShow(true);
    }
  }, []);

  const dismiss = () => {
    try { sessionStorage.setItem('r2d_dismissed_inapp', '1'); } catch { /* ignore */ }
    setShow(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard may be blocked */
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[70] bg-black text-white px-5 py-4 shadow-2xl"
        >
          <div className="max-w-2xl mx-auto flex items-start gap-4">
            <div className="flex-1">
              <p className="font-bold text-sm">Open in your browser for the best experience</p>
              <p className="text-xs text-gray-400 mt-1">
                You're viewing this inside an in-app browser where the back button and links may not work. Tap the menu (⋯) and choose "Open in browser", or copy the link.
              </p>
              <button
                onClick={copyLink}
                className="mt-3 inline-flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-rose-500 transition-all"
              >
                {copied ? 'Link Copied!' : 'Copy Link'}
              </button>
            </div>
            <button onClick={dismiss} aria-label="Dismiss" className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/** Scroll-to-top control for the long single page (kept clear of the right-side CTAs). */
const BackToTop = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => animateScroll.scrollToTop({ smooth: true, duration: 600 })}
          aria-label="Back to top"
          className="fixed bottom-24 left-4 md:bottom-8 md:left-8 z-50 w-12 h-12 bg-white border border-gray-200 shadow-lg rounded-full flex items-center justify-center text-gray-600 hover:text-rose-600 hover:border-rose-200 transition-colors"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

/** Persistent bottom action bar on mobile so Call / WhatsApp / Book are always one tap away. */
const MobileActionBar = () => {
  const { selectedPackage } = useBooking();
  const waMessage = selectedPackage
    ? `Hi Raj, I'd like to book the ${selectedPackage} package.`
    : "Hi Raj, I'd like to book a driving lesson.";

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 grid grid-cols-3 bg-white/95 backdrop-blur border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <a href="tel:+17802358082" className="flex flex-col items-center justify-center gap-1 py-3 text-gray-700 active:bg-gray-50">
        <Phone className="w-5 h-5" />
        <span className="text-[11px] font-bold">Call</span>
      </a>
      <a
        href={buildWhatsAppLink(waMessage)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center gap-1 py-3 text-[#128C7E] border-x border-gray-100 active:bg-gray-50"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-[11px] font-bold">WhatsApp</span>
      </a>
      <Link to="booking" smooth={true} offset={-80} className="flex flex-col items-center justify-center gap-1 py-3 bg-rose-600 text-white active:bg-rose-700 cursor-pointer">
        <Calendar className="w-5 h-5" />
        <span className="text-[11px] font-bold">Book</span>
      </Link>
    </div>
  );
};

/**
 * Desktop sticky CTA — slides up after the hero, follows the user down the page,
 * and reflects the package they last tapped. Dismissible for the session.
 * (Mobile already has MobileActionBar; this is hidden below md.)
 */
const StickyCTA = () => {
  const { selectedPackage } = useBooking();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('r2d_cta_dismissed')) {
      setDismissed(true);
      return;
    }
    const onScroll = () => {
      const y = window.scrollY;
      // Show past the hero, hide near the very bottom so it doesn't sit over the footer.
      const nearBottom = window.innerHeight + y > document.body.scrollHeight - 640;
      setShow(y > 620 && !nearBottom);
    };
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dismiss = () => {
    try { sessionStorage.setItem('r2d_cta_dismissed', '1'); } catch { /* ignore */ }
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="hidden md:block fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[min(900px,calc(100vw-12rem))]"
        >
          <div className="shine shine-soft flex items-center gap-6 bg-black text-white rounded-2xl shadow-2xl shadow-black/30 pl-7 pr-3 py-4 border border-white/10">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Calendar className="w-6 h-6 text-rose-500 shrink-0" />
              <div className="min-w-0">
                <p className="font-black leading-tight truncate">
                  {selectedPackage ? `Ready to book the ${selectedPackage} package?` : 'Ready to hit the road?'}
                </p>
                <p className="text-xs text-gray-400 truncate">Free pickup in Edmonton · 98% first-try pass rate</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="tel:+17802358082"
                className="hidden lg:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border border-white/20 hover:bg-white/10 transition-colors"
              >
                <Phone className="w-4 h-4" /> Call
              </a>
              <Link
                to="booking"
                smooth={true}
                offset={-80}
                className="inline-flex items-center gap-2 bg-rose-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-rose-500 active:scale-95 transition-all cursor-pointer"
              >
                Book a Lesson <ChevronRight className="w-4 h-4" />
              </Link>
              <button onClick={dismiss} aria-label="Dismiss" className="p-2 text-gray-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  const [selectedPackage, setSelectedPackage] = useState('');

  // Deep-link support: if the page loads with a #section hash, scroll there.
  useEffect(() => {
    const id = window.location.hash.replace('#', '');
    if (!id) return;
    const t = setTimeout(() => {
      try { scroller.scrollTo(id, { smooth: true, offset: -80, duration: 600 }); } catch { /* unknown id */ }
    }, 350);
    return () => clearTimeout(t);
  }, []);

  // Keep the URL hash in sync with the section in view so any section is shareable/bookmarkable.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const url = entry.target.id === 'home'
            ? window.location.pathname + window.location.search
            : `#${entry.target.id}`;
          window.history.replaceState(null, '', url);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    PAGE_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <BookingContext.Provider value={{ selectedPackage, setSelectedPackage }}>
      <div className="min-h-screen pb-20 md:pb-0 selection:bg-rose-100 selection:text-rose-900">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-rose-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold focus:shadow-lg"
        >
          Skip to main content
        </a>
        <ScrollProgressBar />
        <InAppBrowserBanner />
        <Navbar />
        <main id="main" tabIndex={-1} className="outline-none">
          <Hero />
          <Services />
          <Packages />
          <Booking />
          <Testimonials />
          <FAQ />
          <About />
          <TrainingVideos />
          <StudyQuiz />
          <Contact />
        </main>
        <Footer />
        <StickyCTA />
        <BackToTop />
        <MobileActionBar />
      </div>
    </BookingContext.Provider>
  );
}
