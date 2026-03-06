'use client';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import { useRef } from 'react';
import {
  ArrowRight,
  Check,
  Github,
  Globe,
  Instagram,
  LineChart,
  RefreshCw,
  TrendingUp,
  Trophy,
  Twitter,
  Users,
  Zap,
} from 'lucide-react';

const Noise = () => (
  <div className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.03] mix-blend-overlay">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
    >
      <filter id="noise">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.8"
          numOctaves="4"
          stitchTiles="stitch"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  </div>
);

function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 w-full z-20 glass-header border-b border-white/10 dark:border-white/5 bg-white/70 dark:bg-[#06080D]/70 transition-all pt-[max(0px,env(safe-area-inset-top))]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0 flex items-center gap-2 cursor-pointer group"
          >
            <Zap className="text-primary w-8 h-8 fill-primary group-hover:drop-shadow-[0_0_8px_rgba(252,76,2,0.5)] transition-all duration-300" />
            <span className="font-extrabold text-2xl tracking-tighter text-gray-900 dark:text-white">
              STRIVE
            </span>
          </motion.div>
          <div className="flex items-center gap-6">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/login"
              className="hidden md:inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold rounded-full text-white bg-primary hover:bg-[#e04000] focus:ring-4 focus:ring-primary/20 transition-all shadow-[0_4px_14px_0_rgba(252,76,2,0.39)] hover:shadow-[0_6px_20px_rgba(252,76,2,0.23)] border border-primary/50"
            >
              Log in
            </motion.a>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden selection:bg-primary/30">
      {/* Background Ambience Removed for iOS Safari Compatibility */}
      <div className="absolute inset-0 z-0 bg-background-light dark:bg-[#0B0F19]"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/10 text-gray-900 dark:text-gray-200 text-xs font-bold tracking-widest uppercase mb-10 shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Now syncing with Nike Run Club
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-gray-900 dark:text-white mb-6 leading-[1.1] md:leading-[1.05]"
        >
          Sync. Compete. <br className="hidden md:block" />
          <span className="relative inline-block">
            <span className="absolute -inset-1 bg-gradient-to-r from-primary to-orange-400 opacity-20 dark:opacity-30 blur-2xl"></span>
            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#ff6a00] to-orange-400">
              Conquer.
            </span>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-2xl mx-auto text-xl md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium tracking-tight"
        >
          Your fitness journey, unified. Automatically sync activities from{' '}
          <strong className="text-gray-900 dark:text-gray-200 font-bold">
            Strava
          </strong>{' '}
          and{' '}
          <strong className="text-gray-900 dark:text-gray-200 font-bold">
            NRC
          </strong>{' '}
          to unlock global leaderboards and private clubs.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-full text-white bg-primary hover:bg-[#e04000] transition-colors shadow-[0_8px_30px_rgb(252,76,2,0.3)] focus:outline-none focus:ring-4 focus:ring-primary/20"
            href="/login"
          >
            Get Started Free
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.a>
          {/* <motion.a
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(0,0,0,0.02)' }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-gray-200 dark:border-white/10 text-lg font-bold rounded-full text-gray-900 dark:text-white bg-white/50 dark:bg-white/5 backdrop-blur-sm hover:border-gray-300 dark:hover:border-white/20 transition-all focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-white/10"
            href="#features"
          >
            Explore Features
          </motion.a> */}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24 relative mx-auto max-w-5xl group perspective-1000"
        >
          <motion.div
            whileHover={{ rotateX: 2, rotateY: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="rounded-[2.5rem] bg-gradient-to-b from-gray-100 to-white dark:from-white/5 dark:to-transparent p-2 md:p-4 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] transform-gpu"
          >
            <div className="relative rounded-[2rem] overflow-hidden bg-gray-50 dark:bg-[#0B0F19] border border-gray-200/50 dark:border-white/5 ring-1 ring-black/5 dark:ring-white/10">
              <img
                alt="Strive Dashboard Interface"
                className="w-full h-auto object-cover block dark:hidden opacity-95 group-hover:opacity-100 transition-opacity duration-700"
                src="/sample.webp"
              />
              <img
                alt="Strive Dashboard Interface Dark Mode"
                className="w-full h-auto object-cover hidden dark:block opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                src="/sample.webp"
              />

              {/* Overlay Gradient for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-background-light via-transparent to-transparent dark:from-[#0B0F19] dark:via-transparent dark:to-transparent opacity-60"></div>
            </div>
          </motion.div>

          {/* Floating UI Elements */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="absolute -top-4 -right-2 md:top-[10%] md:-right-12 z-20 pointer-events-none scale-[0.6] sm:scale-75 md:scale-100 origin-top-right"
          >
            <div className="bg-white/90 dark:bg-black/80 backdrop-blur-xl p-4 md:p-5 rounded-2xl shadow-xl border border-black/5 dark:border-white/10 flex items-center gap-4 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.1)]">
              <div className="bg-primary/10 dark:bg-primary/20 p-2.5 rounded-xl border border-primary/20">
                <Trophy className="text-primary w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold mb-0.5">
                  Global Rank
                </p>
                <p className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  Top 5%
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{
              repeat: Infinity,
              duration: 5,
              ease: 'easeInOut',
              delay: 1,
            }}
            className="absolute -bottom-4 -left-2 md:bottom-[20%] md:-left-16 z-20 pointer-events-none scale-[0.6] sm:scale-75 md:scale-100 origin-bottom-left"
          >
            <div className="bg-white/90 dark:bg-black/80 backdrop-blur-xl p-4 md:p-5 rounded-2xl shadow-xl border border-black/5 dark:border-white/10 flex items-center gap-4 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.1)]">
              <div className="bg-blue-500/10 dark:bg-blue-500/20 p-2.5 rounded-xl border border-blue-500/20">
                <TrendingUp className="text-blue-500 dark:text-blue-400 w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold mb-0.5">
                  Weekly Mileage
                </p>
                <div className="flex items-baseline gap-1">
                  <p className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                    42.5
                  </p>
                  <span className="text-sm font-bold text-gray-500">km</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Integrations() {
  return (
    <section className="py-16 bg-white dark:bg-[#06080D] border-y border-gray-100 dark:border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-10">
          Seamlessly integrated with
        </p>
        <div className="flex justify-center items-center gap-16 md:gap-24">
          <motion.div
            whileHover={{ scale: 1.05, filter: 'grayscale(0%) opacity(1)' }}
            className="flex items-center gap-2 grayscale opacity-50 dark:opacity-40 transition-all duration-300 cursor-pointer"
          >
            <span className="text-3xl font-black font-sans text-[#fc4c02] tracking-tighter">
              STRAVA
            </span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05, filter: 'grayscale(0%) opacity(1)' }}
            className="flex items-center gap-2 grayscale opacity-50 dark:opacity-40 transition-all duration-300 cursor-pointer"
          >
            <span className="text-3xl font-black font-sans italic text-black dark:text-white tracking-widest style-nrc">
              NRC
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Capabilities() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 } as any,
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 } as any,
    },
  };

  const mobileRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: mobileRef,
    offset: ['start start', 'end end'],
  });

  // The effect: 4 cards. Top card scales down, moves down, and goes to the back.
  // We use scrollYProgress to map zIndex directly so the element goes behind the rest smoothly.

  // Card 1
  const card1X = useTransform(
    scrollYProgress,
    [0, 0.16, 0.33],
    ['0vw', '40vw', '0vw']
  );
  const card1Rotate = useTransform(
    scrollYProgress,
    [0, 0.16, 0.33],
    [0, 15, 0]
  );
  const card1Y = useTransform(scrollYProgress, [0, 0.33], ['0vh', '5vh']);
  const card1Scale = useTransform(scrollYProgress, [0, 0.33], [1, 0.9]);
  const card1Z = useTransform(scrollYProgress, [0, 0.1, 0.33], [40, 39, 10]);
  const card1Opacity = useTransform(scrollYProgress, [0, 0.33], [1, 0.5]);

  // Card 2
  const card2X = useTransform(
    scrollYProgress,
    [0, 0.33, 0.5, 0.66],
    ['0vw', '0vw', '40vw', '0vw']
  );
  const card2Rotate = useTransform(
    scrollYProgress,
    [0, 0.33, 0.5, 0.66],
    [0, 0, 15, 0]
  );
  const card2Y = useTransform(
    scrollYProgress,
    [0, 0.33, 0.66],
    ['5vh', '0vh', '5vh']
  );
  const card2Scale = useTransform(
    scrollYProgress,
    [0, 0.33, 0.66],
    [0.95, 1, 0.9]
  );
  const card2Z = useTransform(
    scrollYProgress,
    [0, 0.33, 0.43, 0.66],
    [30, 40, 39, 10]
  );
  const card2Opacity = useTransform(
    scrollYProgress,
    [0, 0.33, 0.66],
    [0.8, 1, 0.5]
  );

  // Card 3
  const card3X = useTransform(
    scrollYProgress,
    [0, 0.66, 0.83, 1],
    ['0vw', '0vw', '40vw', '0vw']
  );
  const card3Rotate = useTransform(
    scrollYProgress,
    [0, 0.66, 0.83, 1],
    [0, 0, 15, 0]
  );
  const card3Y = useTransform(
    scrollYProgress,
    [0, 0.33, 0.66, 1],
    ['10vh', '5vh', '0vh', '5vh']
  );
  const card3Scale = useTransform(
    scrollYProgress,
    [0, 0.33, 0.66, 1],
    [0.9, 0.95, 1, 0.9]
  );
  const card3Z = useTransform(
    scrollYProgress,
    [0, 0.33, 0.66, 0.76, 1],
    [20, 30, 40, 39, 10]
  );
  const card3Opacity = useTransform(
    scrollYProgress,
    [0, 0.33, 0.66, 1],
    [0.6, 0.8, 1, 0.5]
  );

  // Card 4 (Never gets flicked to the back as it's the last one)
  const card4Y = useTransform(
    scrollYProgress,
    [0, 0.33, 0.66, 1],
    ['15vh', '10vh', '5vh', '0vh']
  );
  const card4Scale = useTransform(
    scrollYProgress,
    [0, 0.33, 0.66, 1],
    [0.85, 0.9, 0.95, 1]
  );
  const card4Z = useTransform(
    scrollYProgress,
    [0, 0.33, 0.66, 1],
    [10, 20, 30, 40]
  );
  const card4Opacity = useTransform(
    scrollYProgress,
    [0, 0.33, 0.66, 1],
    [0.4, 0.6, 0.8, 1]
  );

  return (
    <section
      className="py-24 md:py-32 bg-background-light dark:bg-[#0B0F19] relative"
      id="features"
    >
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full relative">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-100px' }}
            className="text-sm text-primary font-black tracking-[0.2em] uppercase mb-4"
          >
            Platform Capabilities
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-100px' }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-6 leading-tight"
          >
            Everything you need to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
              level up.
            </span>
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-100px' }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium"
          >
            Strive bridges the gap between platforms, bringing all your fitness
            data into one cohesive ecosystem.
          </motion.p>
        </div>

        {/* Mobile 3D Scroll Stacking */}
        <div
          ref={mobileRef}
          className="md:hidden h-[400vh] relative w-full -mx-4 px-4 overflow-visible"
        >
          <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-visible w-full relative">
            <motion.div
              style={{
                x: card1X,
                y: card1Y,
                rotate: card1Rotate,
                scale: card1Scale,
                opacity: card1Opacity,
                zIndex: card1Z,
                transformOrigin: 'top center',
              }}
              className="absolute w-full px-4"
            >
              <div className="p-8 bg-white dark:bg-[#121826] rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-2xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-b-[4rem] rounded-tl-[2rem]"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary border border-primary/10">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Multi-Platform Sync
                  </h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                  Connect Strava and Nike Run Club accounts simultaneously. No
                  more manual entry.
                </p>
              </div>
            </motion.div>

            <motion.div
              style={{
                x: card2X,
                y: card2Y,
                rotate: card2Rotate,
                scale: card2Scale,
                opacity: card2Opacity,
                zIndex: card2Z,
                transformOrigin: 'top center',
              }}
              className="absolute w-full px-4"
            >
              <div className="p-8 bg-white dark:bg-[#121826] rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.1)]">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-b-[4rem] rounded-tl-[2rem]"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-500 border border-blue-500/10">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Global Leaderboards
                  </h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                  See where you stand against runners worldwide, regardless of
                  which app they use.
                </p>
              </div>
            </motion.div>

            <motion.div
              style={{
                x: card3X,
                y: card3Y,
                rotate: card3Rotate,
                scale: card3Scale,
                opacity: card3Opacity,
                zIndex: card3Z,
                transformOrigin: 'top center',
              }}
              className="absolute w-full px-4"
            >
              <div className="p-8 bg-white dark:bg-[#121826] rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.1)]">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-b-[4rem] rounded-tl-[2rem]"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center text-purple-500 border border-purple-500/10">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Private Clubs
                  </h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                  Create exclusive groups for friends, companies, or run clubs
                  with custom challenges.
                </p>
              </div>
            </motion.div>

            <motion.div
              style={{
                y: card4Y,
                scale: card4Scale,
                opacity: card4Opacity,
                zIndex: card4Z,
                transformOrigin: 'top center',
              }}
              className="absolute w-full px-4"
            >
              <div className="p-8 bg-white dark:bg-[#121826] rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.1)]">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-b-[4rem] rounded-tl-[2rem]"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center text-green-500 border border-green-500/10">
                    <LineChart className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Detailed Analytics
                  </h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                  Deep dive into your performance trends with aggregated data
                  visualization.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Desktop Horizontal Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, margin: '-100px' }}
          className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-20"
        >
          <motion.div
            variants={item}
            whileHover={{ y: -8 }}
            className="group relative p-8 bg-white dark:bg-[#121826] rounded-[2rem] border border-gray-100 dark:border-white/5 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-b-[4rem] rounded-tl-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-8 text-primary shadow-inner border border-primary/10">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Multi-Platform Sync
            </h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
              Connect Strava and Nike Run Club accounts simultaneously. No more
              manual entry.
            </p>
          </motion.div>

          <motion.div
            variants={item}
            whileHover={{ y: -8 }}
            className="group relative p-8 bg-white dark:bg-[#121826] rounded-[2rem] border border-gray-100 dark:border-white/5 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-b-[4rem] rounded-tl-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center mb-8 text-blue-500 shadow-inner border border-blue-500/10">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Global Leaderboards
            </h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
              See where you stand against runners worldwide, regardless of which
              app they use.
            </p>
          </motion.div>

          <motion.div
            variants={item}
            whileHover={{ y: -8 }}
            className="group relative p-8 bg-white dark:bg-[#121826] rounded-[2rem] border border-gray-100 dark:border-white/5 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-b-[4rem] rounded-tl-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center mb-8 text-purple-500 shadow-inner border border-purple-500/10">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Private Clubs
            </h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
              Create exclusive groups for friends, companies, or run clubs with
              custom challenges.
            </p>
          </motion.div>

          <motion.div
            variants={item}
            whileHover={{ y: -8 }}
            className="group relative p-8 bg-white dark:bg-[#121826] rounded-[2rem] border border-gray-100 dark:border-white/5 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-b-[4rem] rounded-tl-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center mb-8 text-green-500 shadow-inner border border-green-500/10">
              <LineChart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Detailed Analytics
            </h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
              Deep dive into your performance trends with aggregated data
              visualization.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function LeaderboardSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 } as any,
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: {
      opacity: 1,
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 } as any,
    },
  };

  return (
    <section
      className="py-32 overflow-hidden bg-white dark:bg-[#06080D] relative"
      id="leaderboards"
    >
      {/* Decorative Blur */}
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen opacity-50 dark:opacity-20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <motion.div
            initial={{ opacity: 0, x: -50, rotateY: -10 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: false, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:w-1/2 relative w-full perspective-1000"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-blue-500/10 to-transparent rounded-[2.5rem] transform rotate-3 scale-105 blur-sm opacity-50"></div>

            <motion.div
              whileHover={{ rotateX: 2, rotateY: 2, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="relative rounded-[2rem] overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/5 bg-white dark:bg-[#121826] transform-gpu"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h4 className="font-extrabold text-xl text-gray-900 dark:text-white tracking-tight">
                    Weekly Distance
                  </h4>
                  <span className="text-xs text-primary font-bold cursor-pointer hover:text-[#e04000] flex items-center gap-1 group transition-colors">
                    View Full{' '}
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: false }}
                  className="space-y-4"
                >
                  {[
                    {
                      rank: 1,
                      initials: 'JM',
                      name: 'James M.',
                      distance: '84.5',
                      color: 'text-yellow-700 bg-yellow-100',
                      avatarBg: 'bg-yellow-500/10',
                    },
                    {
                      rank: 2,
                      initials: 'SJ',
                      name: 'Sarah J.',
                      distance: '72.1',
                      color: 'text-pink-600 bg-pink-100',
                      avatarBg: 'bg-pink-500/10',
                    },
                    {
                      rank: 3,
                      initials: 'R',
                      name: 'You',
                      distance: '68.4',
                      color: 'text-primary bg-primary/10',
                      avatarBg: 'bg-primary/5',
                      highlight: true,
                    },
                  ].map((user, idx) => (
                    <motion.div
                      key={idx}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-colors cursor-pointer ${user.highlight ? 'bg-primary/5 border-primary/20 hover:bg-primary/10' : 'bg-gray-50 dark:bg-[#0B0F19] border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-xl ${user.color} flex items-center justify-center font-black text-sm shadow-sm`}
                        >
                          {user.rank}
                        </div>
                        <div
                          className={`w-10 h-10 rounded-full ${user.avatarBg} text-gray-700 dark:text-gray-300 flex items-center justify-center font-bold text-sm border border-black/5 dark:border-white/10`}
                        >
                          {user.initials}
                        </div>
                        <span
                          className={`font-bold text-base ${user.highlight ? 'text-primary' : 'text-gray-900 dark:text-white'}`}
                        >
                          {user.name}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-black text-lg text-gray-900 dark:text-white tracking-tight">
                          {user.distance}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          km
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:w-1/2"
          >
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
              Compete on a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                Level Playing Field.
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed font-medium">
              It doesn't matter if your friends use different apps. Strive
              normalizes the data to create fair, engaging leaderboards. Track
              distance, elevation, pace, and consistency across your entire
              network.
            </p>
            <ul className="space-y-6">
              {[
                'Automated weekly and monthly challenges',
                'Segment comparisons across platforms',
                'Real-time rank updates',
              ].map((item, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="flex items-start group"
                >
                  <span className="flex-shrink-0 h-8 w-8 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mr-4 group-hover:scale-110 group-hover:bg-green-500/20 transition-all">
                    <Check className="text-green-500 w-4 h-4" />
                  </span>
                  <span className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                    {item}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section
      className="py-32 relative overflow-hidden bg-white dark:bg-[#06080D]"
      id="clubs"
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 -skew-y-3 transform origin-bottom-left scale-110"></div>
      <div className="absolute inset-0">
        <svg
          className="w-full h-full opacity-[0.02] dark:opacity-[0.04]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid-pattern"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: false, margin: '-100px' }}
        transition={{
          duration: 0.8,
          type: 'spring',
          stiffness: 200,
          damping: 20,
        }}
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >
        <div className="bg-white/80 dark:bg-[#121826]/80 backdrop-blur-2xl rounded-[3rem] p-10 md:p-20 text-center border border-white/50 dark:border-white/10 shadow-[0_30px_60px_-15px_rgba(252,76,2,0.1)]">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: false }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
              delay: 0.2,
            }}
            className="w-20 h-20 bg-gradient-to-br from-primary to-orange-400 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-xl shadow-primary/20 rotate-12"
          >
            <Zap className="w-10 h-10 text-white fill-white -rotate-12" />
          </motion.div>

          <h2 className="text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
            Ready to unite your <br className="hidden md:block" /> running life?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto font-medium">
            Join thousands of runners who have already synced over 1 million
            kilometers on Strive.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto px-10 py-5 bg-primary text-white text-lg font-bold rounded-full shadow-[0_10px_30px_rgba(252,76,2,0.3)] hover:bg-[#e04000] hover:shadow-[0_15px_40px_rgba(252,76,2,0.4)] transition-all flex items-center justify-center gap-3"
              href="/login"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.03, backgroundColor: 'rgba(0,0,0,0.03)' }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto px-10 py-5 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 text-lg font-bold rounded-full hover:border-gray-300 dark:hover:border-white/20 transition-all flex items-center justify-center"
              href="#clubs"
            >
              Explore Clubs
            </motion.a>
          </div>
          <p className="mt-8 text-sm font-bold text-gray-400 uppercase tracking-widest">
            No credit card required
          </p>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-white dark:bg-[#06080D] border-t border-gray-100 dark:border-white/5 pt-16 pb-8 relative z-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4 group cursor-pointer">
              <Zap className="text-primary w-6 h-6 fill-primary group-hover:scale-110 transition-transform" />
              <span className="font-extrabold tracking-tighter text-xl text-gray-900 dark:text-white">
                STRIVE
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium leading-relaxed">
              The ultimate dashboard for the modern social athlete. Connect,
              compete, and analyze.
            </p>
            <div className="flex gap-4">
              <a
                className="text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                href="#"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                className="text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                href="#"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                className="text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                href="#"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-gray-200 mb-4 tracking-tight">
              Product
            </h4>
            <ul className="space-y-3 text-sm font-medium text-gray-500 dark:text-gray-400">
              <li>
                <a
                  className="hover:text-primary dark:hover:text-gray-200 transition-colors"
                  href="#"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  className="hover:text-primary dark:hover:text-gray-200 transition-colors"
                  href="#"
                >
                  Integrations
                </a>
              </li>
              <li>
                <a
                  className="hover:text-primary dark:hover:text-gray-200 transition-colors"
                  href="#"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  className="hover:text-primary dark:hover:text-gray-200 transition-colors"
                  href="#"
                >
                  Roadmap
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-gray-200 mb-4 tracking-tight">
              Resources
            </h4>
            <ul className="space-y-3 text-sm font-medium text-gray-500 dark:text-gray-400">
              <li>
                <a
                  className="hover:text-primary dark:hover:text-gray-200 transition-colors"
                  href="#"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  className="hover:text-primary dark:hover:text-gray-200 transition-colors"
                  href="#"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  className="hover:text-primary dark:hover:text-gray-200 transition-colors"
                  href="#"
                >
                  API Docs
                </a>
              </li>
              <li>
                <a
                  className="hover:text-primary dark:hover:text-gray-200 transition-colors"
                  href="#"
                >
                  Community
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-gray-200 mb-4 tracking-tight">
              Legal
            </h4>
            <ul className="space-y-3 text-sm font-medium text-gray-500 dark:text-gray-400">
              <li>
                <a
                  className="hover:text-primary dark:hover:text-gray-200 transition-colors"
                  href="#"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  className="hover:text-primary dark:hover:text-gray-200 transition-colors"
                  href="#"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  className="hover:text-primary dark:hover:text-gray-200 transition-colors"
                  href="#"
                >
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 dark:border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            © 2026 Strive Platforms Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              System Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="min-h-screen font-sans">
      <Navbar />
      <main>
        <Hero />
        <Integrations />
        <Capabilities />
        <LeaderboardSection />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
