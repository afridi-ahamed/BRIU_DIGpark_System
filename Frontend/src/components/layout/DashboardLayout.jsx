import DashboardHeader from './DashboardHeader';
import { motion } from 'framer-motion';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-dvh p-4 md:p-6">
      <DashboardHeader />
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-[1600px] mx-auto"
      >
        {children}
      </motion.main>
    </div>
  );
}
