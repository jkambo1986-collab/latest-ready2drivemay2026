import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { Link } from 'react-scroll';
import { Menu, X, GraduationCap, Phone, ChevronRight, ChevronLeft, Star, ChevronDown, Calendar, Instagram, Facebook, Twitter, MessageCircle, Music, Youtube } from 'lucide-react';
import { cn } from './lib/utils';
import { StudyQuiz } from './components/StudyQuiz';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', to: 'home' },
    { name: 'Services', to: 'services' },
    { name: 'Fees', to: 'packages' },
    { name: 'Book', to: 'booking' },
    { name: 'About', to: 'about' },
    { name: 'Reviews', to: 'testimonials' },
    { name: 'FAQ', to: 'faq' },
    { name: 'Contact', to: 'contact' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6",
      isScrolled 
        ? "bg-white shadow-lg py-2 border-b border-gray-100" 
        : "bg-transparent py-6"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="home" smooth={true} className="flex items-center gap-2 cursor-pointer group">
          <div className={cn("bg-rose-600 p-1.5 rounded-lg group-hover:rotate-12 transition-all duration-500", isScrolled ? "scale-90" : "scale-100")}>
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className={cn("font-extrabold tracking-tighter uppercase transition-all duration-500", isScrolled ? "text-lg" : "text-xl")}>Ready 2 <span className="text-rose-600">Drive</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
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
          ))}
          <Link to="booking" smooth={true} className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-rose-600 transition-all cursor-pointer">
            <Phone className="w-4 h-4" />
            Book Now
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
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
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  smooth={true}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-semibold hover:text-rose-600 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <Link to="booking" smooth={true} className="flex items-center justify-center gap-2 bg-rose-600 text-white px-5 py-4 rounded-xl font-bold cursor-pointer">
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
      className="relative min-h-screen flex items-center pt-20 overflow-hidden"
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

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          style={{ opacity }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-800 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            <GraduationCap className="w-3 h-3" />
            Edmonton's Premier Driving School
          </div>
          <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-8">
            MASTER THE <span className="text-rose-600 italic">ROAD</span> WITH CONFIDENCE
          </h1>
          <p className="text-lg text-gray-600 max-w-lg mb-10 leading-relaxed">
            Professional driving instruction tailored to your needs. From nervous beginners to advanced brush-ups, we ensure you're road-ready and safe.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="booking" smooth={true} className="bg-black text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-rose-600 transition-all flex items-center justify-center gap-2 group cursor-pointer">
              Book a Lesson
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="packages" smooth={true} className="bg-white border-2 border-black px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center cursor-pointer">
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
            <img 
              src="https://i.imgur.com/OVolHZ3.jpg" 
              alt="Driving Lesson" 
              className="w-full aspect-[4/5] object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <p className="text-sm font-bold uppercase tracking-widest mb-2 text-rose-400">Next Available Slot</p>
              <p className="text-2xl font-black">TOMORROW @ 10:00 AM</p>
            </div>
          </div>
          
          {/* Floating Badge */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-6 -right-6 bg-rose-600 text-white p-6 rounded-3xl shadow-xl z-20 hidden md:block"
          >
            <p className="text-4xl font-black leading-none">98%</p>
            <p className="text-xs font-bold uppercase tracking-tighter">Pass Rate</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
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

  return (
    <section id="training" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase">Training <span className="text-rose-600">Videos</span></h2>
          <p className="text-gray-500 mt-4">Watch these helpful videos to master your driving skills.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video) => (
            <div key={video.id} className="rounded-2xl overflow-hidden shadow-lg">
              <iframe
                width="100%"
                height="200"
                src={`https://www.youtube.com/embed/${video.id}`}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Services = () => {
  const services = [
    {
      title: "Class 5 GDL",
      desc: "Comprehensive training for new drivers to get their basic license.",
      icon: "🚗",
      color: "bg-blue-50"
    },
    {
      title: "Advanced Road Test",
      desc: "Preparation for the non-GDL Class 5 road test.",
      icon: "🛣️",
      color: "bg-green-50"
    },
    {
      title: "Brush-up Lessons",
      desc: "Quick sessions to refine your skills before a road test.",
      icon: "✨",
      color: "bg-rose-50"
    },
    {
      title: "Insurance Reduction",
      desc: "Government approved course to lower your premiums.",
      icon: "🛡️",
      color: "bg-purple-50"
    }
  ];

  return (
    <section id="services" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 uppercase">Our <span className="text-rose-600">Expertise</span></h2>
          <p className="text-gray-500 max-w-2xl mx-auto">We offer a wide range of driving courses designed to make you a safe and confident driver for life.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className={cn("p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all bg-white")}
            >
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6", s.color)}>
                {s.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Packages = () => {
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
    <section id="packages" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase">Fee <span className="text-rose-600">Schedule</span></h2>
            <p className="text-gray-500 mt-4">All prices are subject to GST. Professional training for every stage.</p>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((p, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className={cn(
                "relative p-10 rounded-[40px] border-2 transition-all",
                p.popular ? "border-rose-600 bg-black text-white shadow-2xl" : "border-gray-100 bg-white"
              )}
            >
              {p.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                  Best Value
                </div>
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
                className={cn(
                  "w-full py-4 rounded-2xl font-bold transition-all text-center block cursor-pointer",
                  p.popular ? "bg-rose-600 text-white hover:bg-white hover:text-black" : "bg-black text-white hover:bg-rose-600"
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
            className="p-10 rounded-[40px] border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col justify-center items-center text-center"
          >
            <h3 className="text-2xl font-black mb-2">Car Rental</h3>
            <p className="text-4xl font-black mb-4">$100 <span className="text-sm text-gray-400">+ GST</span></p>
            <p className="text-sm text-gray-500 font-medium">Available for road tests. Professional, clean, and test-ready vehicle.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Booking = () => {
  return (
    <section id="booking" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase">Book Your <span className="text-rose-600">Lesson</span></h2>
          <p className="text-gray-500 mt-4">Select a time that works for you and start your journey today.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-2xl mx-auto bg-gray-50 rounded-[40px] p-12 border border-gray-100 shadow-sm text-center"
        >
          <h3 className="text-2xl font-bold mb-8">Ready to start your driving journey?</h3>
          <p className="text-gray-600 mb-10">Contact us directly to schedule your lessons. We're available for calls and messages.</p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a 
              href="https://wa.me/17802358082" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#128C7E] transition-all"
            >
              <MessageCircle className="w-6 h-6" />
              Book via WhatsApp
            </a>
            <a 
              href="tel:+17802358082" 
              className="flex items-center justify-center gap-3 bg-black text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-rose-600 transition-all"
            >
              <Phone className="w-6 h-6" />
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
      image: "https://i.imgur.com/Qu8GQ9S.jpg"
    }
  ];

  return (
    <section id="about" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
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
                <p className="text-4xl font-black text-rose-600 mb-1">15+</p>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Years Experience</p>
              </div>
              <div>
                <p className="text-4xl font-black text-rose-600 mb-1">5k+</p>
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
              <img 
                src="https://i.imgur.com/HLPN225.jpg" 
                alt="Driving School Office" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl hidden md:block">
              <p className="text-rose-600 font-black text-xl italic">"Safety First, Always."</p>
            </div>
          </motion.div>
        </div>

        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-black tracking-tight uppercase">Meet Our <span className="text-rose-600">Instructors</span></h3>
          <p className="text-gray-500 mt-4">Learn from the best in the industry.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {instructors.map((instructor, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row gap-8 items-center md:items-start"
            >
              <img 
                src={instructor.image} 
                alt={instructor.name} 
                className="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover shadow-lg"
                referrerPolicy="no-referrer"
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

const Testimonials = () => {
  const testimonials = [
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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

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
    <section id="testimonials" className="py-24 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase">Student <span className="text-rose-600">Success</span></h2>
          <p className="text-gray-500 mt-4">Hear from some of our 5,000+ confident drivers who mastered the road with us.</p>
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
                  <img 
                    src={testimonials[currentIndex].image} 
                    alt={testimonials[currentIndex].name} 
                    className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-lg"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex justify-center md:justify-start text-rose-600 mb-4">
                      {[1,2,3,4,5].map(star => <Star key={star} className="w-5 h-5 fill-current" />)}
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
              className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400 hover:text-rose-600 hover:scale-110 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-16 z-10">
            <button 
              onClick={nextTestimonial}
              className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400 hover:text-rose-600 hover:scale-110 transition-all"
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
    </section>
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
    <section id="faq" className="py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
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
              className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-bold text-lg pr-8">{faq.question}</span>
                <ChevronDown className={cn("w-5 h-5 text-rose-600 transition-transform duration-300", openIndex === i && "rotate-180")} />
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

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    service: 'Class 5 GDL Training',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]{7,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number format';
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors({});
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ fullName: '', phoneNumber: '', service: 'Class 5 GDL Training', message: '' });
      setTimeout(() => setIsSuccess(false), 5000);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
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
    <section id="contact" className="py-24 bg-black text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-rose-600/5 -skew-x-12 translate-x-1/4" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-none">
              READY TO <br />
              <span className="text-rose-600">START?</span>
            </h2>
            <p className="text-gray-400 text-lg mb-12 max-w-md">
              Have questions about our courses or scheduling? Send us a message and our team will get back to you within 2 hours.
            </p>
            
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Phone className="text-rose-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Call Us</p>
                  <p className="text-xl font-bold">(780) 235-8082</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Star className="text-rose-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Office</p>
                  <p className="text-xl font-bold">1503, 12 ST. NW Edmonton T6T 2V2</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Star className="text-rose-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Email</p>
                  <p className="text-xl font-bold">rajmangat121@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white text-black p-10 rounded-[40px] shadow-2xl"
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
                    <Star className="w-10 h-10 fill-current" />
                  </div>
                  <h3 className="text-3xl font-black mb-4 uppercase">Message Sent!</h3>
                  <p className="text-gray-500">Thank you for reaching out. We'll get back to you within 2 hours.</p>
                </motion.div>
              ) : (
                <form key="form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Full Name</label>
                      <input 
                        type="text" 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={cn(
                          "w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 transition-all",
                          errors.fullName ? "ring-2 ring-red-500" : "focus:ring-rose-600"
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
                        className={cn(
                          "w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 transition-all",
                          errors.phoneNumber ? "ring-2 ring-red-500" : "focus:ring-rose-600"
                        )} 
                        placeholder="We'll call you back soon" 
                      />
                      {errors.phoneNumber && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{errors.phoneNumber}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Service Interested In</label>
                    <select 
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-rose-600 transition-all"
                    >
                      <option>Class 5 GDL Training</option>
                      <option>Insurance Reduction Course</option>
                      <option>Brush-up Lesson</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Message</label>
                    <textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className={cn(
                        "w-full bg-gray-50 border-none rounded-xl p-4 h-32 focus:ring-2 transition-all",
                        errors.message ? "ring-2 ring-red-500" : "focus:ring-rose-600"
                      )} 
                      placeholder="How can we help you master the road?"
                    ></textarea>
                    {errors.message && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{errors.message}</p>}
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      "w-full bg-black text-white py-5 rounded-2xl font-black text-lg hover:bg-rose-600 transition-all flex items-center justify-center gap-2",
                      isSubmitting && "opacity-70 cursor-not-allowed"
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
        className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
        aria-label={social.name}
      >
        <social.icon className="w-5 h-5" />
      </a>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="py-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="bg-rose-600 p-1 rounded-lg">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tighter uppercase">Ready 2 <span className="text-rose-600">Drive</span></span>
        </div>
        
        <p className="text-sm text-gray-400 font-medium">© 2024 Ready 2 Drive Driving School. All rights reserved.</p>
        
        <div className="flex gap-6">
          {[
            { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/ready2driv.e?igsh=MWx2c3ZlMXhoNjk0dQ%3D%3D' },
            { name: 'Facebook', icon: Facebook, href: 'https://www.facebook.com/profile.php?id=61588801644776' },
            { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/ready2drive' },
            { name: 'TikTok', icon: Music, href: 'https://www.tiktok.com/@ready2drive4?_r=1&_t=ZS-95vk5EujQs1' },
            { name: 'YouTube', icon: Youtube, href: 'https://www.youtube.com/@ready2drive-z1h' }
          ].map(social => (
            <SocialLink key={social.name} social={social} />
          ))}
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
          className="fixed bottom-8 right-8 z-50"
        >
          <Link
            to="booking"
            smooth={true}
            offset={-100}
            duration={800}
            className="flex items-center gap-3 bg-rose-600 text-white px-6 py-4 rounded-full font-black shadow-2xl hover:bg-black hover:scale-105 transition-all cursor-pointer group"
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

export default function App() {
  return (
    <div className="min-h-screen selection:bg-rose-100 selection:text-rose-900">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Packages />
        <Booking />
        <TrainingVideos />
        <StudyQuiz />
        <About />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <FloatingBookingButton />
    </div>
  );
}
