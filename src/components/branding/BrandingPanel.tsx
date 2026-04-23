import { motion } from 'framer-motion';
import { Logo } from '@/assets/Logo';
import { GraduationCap, Users, BookOpen, BarChart3, Shield } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Student Management',
    description: 'Easily manage student records, attendance, and enrollment.',
  },
  {
    icon: BookOpen,
    title: 'Academic Planning',
    description: 'Streamline curriculum design and class scheduling.',
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    description: 'Track and analyze student and school performance metrics.',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security for your sensitive data.',
  },
];

export function BrandingPanel() {
  return (
    <div className="relative flex flex-col justify-between w-full h-full p-8 overflow-hidden bg-gray-900 lg:p-12">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], scale: [1, 1.05, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[10%] left-[10%] w-64 h-64 rounded-full bg-orange-500 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-[20%] right-[10%] w-80 h-80 rounded-full bg-orange-400 blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 mb-12"
        >

          <Logo variant='light' size={32} />
        </motion.div>

        <div className="flex-1 max-w-md mt-8 lg:mt-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl font-bold leading-tight text-white lg:text-4xl font-heading mb-4"
          >
            Streamline Your School Operations
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-gray-400 text-lg mb-12"
          >
            The all-in-one platform designed to simplify administration, empower teachers, and engage students.
          </motion.p>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800/50 border border-gray-700 text-orange-400 shrink-0">
                  <feature.icon size={20} />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-12 pt-8 border-t border-gray-800 text-gray-500 text-sm"
        >
          © {new Date().getFullYear()} Kakipi Orange. All rights reserved.
        </motion.div>
      </div>
    </div>
  );
}