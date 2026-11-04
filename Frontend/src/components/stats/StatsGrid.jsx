import { motion } from 'framer-motion';
import StatCard from './StatCard';

const StatsGrid = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-7">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07, type: 'spring', stiffness: 280, damping: 24 }}
        >
          <StatCard
            title={stat.title}
            value={stat.value}
            total={stat.total}
            progress={stat.progress}
            trend={stat.trend}
            isUrgent={stat.isUrgent}
            color={stat.color}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default StatsGrid;
