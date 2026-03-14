import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../App';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Users, CheckCircle, XCircle, Clock, TrendingUp, Loader2, Sparkles, Zap, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const DashboardPage = () => {
  const { API } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-10 h-10 text-cyan-400 loader-premium" />
        </motion.div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Applications',
      value: stats?.total_applications || 0,
      icon: Briefcase,
      gradient: 'from-cyan-500 to-blue-600',
      glow: 'glow-cyan',
      iconBg: 'bg-cyan-500/20',
      iconColor: 'text-cyan-400',
    },
    {
      title: 'Interviews',
      value: stats?.interviews || 0,
      icon: Users,
      gradient: 'from-violet-500 to-purple-600',
      glow: 'shadow-violet-500/30',
      iconBg: 'bg-violet-500/20',
      iconColor: 'text-violet-400',
    },
    {
      title: 'Offers',
      value: stats?.offers || 0,
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-teal-600',
      glow: 'glow-emerald',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
    },
    {
      title: 'This Week',
      value: stats?.applications_this_week || 0,
      icon: Zap,
      gradient: 'from-amber-500 to-orange-600',
      glow: 'glow-gold',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
    },
  ];

  const pieData = [
    { name: 'Applied', value: stats?.pending || 0, color: '#67e8f9' },
    { name: 'Interview', value: stats?.interviews || 0, color: '#a78bfa' },
    { name: 'Offer', value: stats?.offers || 0, color: '#6ee7b7' },
    { name: 'Rejected', value: stats?.rejections || 0, color: '#fca5a5' },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      {/* Header with Animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-5xl font-bold mb-3 flex items-center gap-3">
            <span className="neon-text-cyan">Dashboard</span>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-8 h-8 text-amber-400" />
            </motion.div>
          </h1>
          <p className="text-slate-400 text-lg">Overview of your job application journey</p>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="glass-card-premium px-6 py-3 rounded-full"
        >
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-400 font-semibold">{stats?.total_applications || 0} Applications</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Stats Grid with Glassmorphism */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
              whileHover={{ y: -8, scale: 1.02 }}
              data-testid={`stat-card-${stat.title.toLowerCase().replace(' ', '-')}`}
              className="glass-card-premium rounded-2xl p-6 hover-lift cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.iconBg} p-3 rounded-xl ${stat.glow}`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-xs font-medium text-slate-500"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-glow"></div>
                </motion.div>
              </div>
              <p className="text-sm font-medium text-slate-400 mb-2">{stat.title}</p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-4xl font-bold text-white"
              >
                {stat.value}
              </motion.p>
              <div className={`mt-3 h-1 w-full rounded-full bg-gradient-to-r ${stat.gradient} opacity-50`}></div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Chart */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card-premium rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-cyan-500/20 p-2 rounded-lg glow-cyan">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Top Platforms</h3>
          </div>
          {stats?.top_platforms?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.top_platforms}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="platform" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 20, 25, 0.95)',
                    border: '1px solid rgba(103, 232, 249, 0.3)',
                    borderRadius: '12px',
                    color: '#fff',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="url(#colorGradient)"
                  radius={[12, 12, 0, 0]}
                  animationDuration={1000}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#67e8f9" stopOpacity={1} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-500">
              <p>No application data yet</p>
            </div>
          )}
        </motion.div>

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card-premium rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-violet-500/20 p-2 rounded-lg shadow-violet-500/30">
              <Clock className="w-5 h-5 text-violet-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Status Distribution</h3>
          </div>
          {stats?.total_applications > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={1000}
                  stroke="rgba(0,0,0,0.5)"
                  strokeWidth={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 20, 25, 0.95)',
                    border: '1px solid rgba(103, 232, 249, 0.3)',
                    borderRadius: '12px',
                    color: '#fff',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-500">
              <p>No application data yet</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Applications */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card-premium rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-cyan-400" />
          Recent Applications
        </h3>
        {stats?.recent_applications?.length > 0 ? (
          <div className="space-y-3">
            <AnimatePresence>
              {stats.recent_applications.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 8, scale: 1.01 }}
                  className="glass-card p-4 rounded-xl hover-lift cursor-pointer"
                  data-testid={`recent-app-${app.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 p-3 rounded-xl border border-cyan-500/30">
                        <Briefcase className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg">{app.company_name}</h4>
                        <p className="text-slate-400 text-sm">{app.role}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span>\ud83d\udccd {app.platform}</span>
                          <span>\u2022</span>
                          <span>{new Date(app.applied_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-medium status-${app.status.toLowerCase()}`}
                      >
                        {app.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-16">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-slate-700" />
            </motion.div>
            <p className="text-slate-500 text-lg">No applications yet. Start tracking your job applications!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DashboardPage;
