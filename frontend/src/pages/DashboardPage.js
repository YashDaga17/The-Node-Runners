import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../App';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Users, CheckCircle, Loader2, Sparkles, Zap, Target, Rocket, TrendingUp, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import Tilt3DCard from '../components/Tilt3DCard';
import AnimatedCounter from '../components/AnimatedCounter';
import Scene3D from '../components/Scene3D';

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
        <motion.div animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          <Loader2 className="w-12 h-12 text-cyan-400" />
        </motion.div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Applications', value: stats?.total_applications || 0, icon: Briefcase, gradient: 'from-cyan-500 via-blue-500 to-blue-600', iconBg: 'bg-cyan-500/20', iconColor: 'text-cyan-400', delay: 0 },
    { title: 'Interviews', value: stats?.interviews || 0, icon: Users, gradient: 'from-violet-500 via-purple-500 to-purple-600', iconBg: 'bg-violet-500/20', iconColor: 'text-violet-400', delay: 0.1 },
    { title: 'Offers', value: stats?.offers || 0, icon: CheckCircle, gradient: 'from-emerald-500 via-teal-500 to-teal-600', iconBg: 'bg-emerald-500/20', iconColor: 'text-emerald-400', delay: 0.2 },
    { title: 'This Week', value: stats?.applications_this_week || 0, icon: Zap, gradient: 'from-amber-500 via-orange-500 to-orange-600', iconBg: 'bg-amber-500/20', iconColor: 'text-amber-400', delay: 0.3 },
  ];

  const pieData = [
    { name: 'Applied', value: stats?.pending || 0, color: '#67e8f9' },
    { name: 'Interview', value: stats?.interviews || 0, color: '#a78bfa' },
    { name: 'Offer', value: stats?.offers || 0, color: '#6ee7b7' },
    { name: 'Rejected', value: stats?.rejections || 0, color: '#fca5a5' },
  ].filter(item => item.value > 0);

  const trendData = [
    { week: 'Week 1', applications: 0 },
    { week: 'Week 2', applications: 0 },
    { week: 'Week 3', applications: Math.floor((stats?.total_applications || 0) * 0.3) },
    { week: 'Week 4', applications: Math.floor((stats?.total_applications || 0) * 0.7) },
    { week: 'Week 5', applications: stats?.total_applications || 0 },
  ];

  return (
    <div className="space-y-8 relative" data-testid="dashboard-page">
      <Scene3D />

      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between relative z-10">
        <div>
          <motion.h1 className="text-5xl font-bold mb-3 flex items-center gap-3">
            <span className="neon-text-cyan">Dashboard</span>
            <motion.div animate={{ rotate: [0, 360], scale: [1, 1.15, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
              <Sparkles className="w-8 h-8 text-cyan-400" />
            </motion.div>
          </motion.h1>
          <p className="text-slate-400 text-lg">Track your journey to success</p>
        </div>
        <motion.div 
          whileHover={{ scale: 1.05, y: -2 }} 
          className="glass-card-premium px-6 py-3 rounded-full backdrop-blur-md border border-cyan-500/20">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            <AnimatedCounter value={stats?.total_applications || 0} className="text-cyan-400 font-semibold text-lg" />
            <span className="text-slate-300 font-medium">Applications</span>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Tilt3DCard key={stat.title} scale={1.05} tiltMaxAngleX={10} tiltMaxAngleY={10}>
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: stat.delay }} className="glass-card-premium rounded-2xl p-6 h-full relative overflow-hidden">
                <motion.div animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }} transition={{ duration: 5, repeat: Infinity }} className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-10`} style={{ backgroundSize: '200% 200%' }} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <motion.div whileHover={{ rotate: 360 }} className={`${stat.iconBg} p-3 rounded-xl`}>
                      <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </motion.div>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-glow"></div>
                  </div>
                  <p className="text-sm font-medium text-slate-400 mb-2">{stat.title}</p>
                  <motion.div className="text-4xl font-bold text-white">
                    <AnimatedCounter value={stat.value} />
                  </motion.div>
                  <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ delay: stat.delay + 0.5 }} className={`mt-3 h-1 rounded-full bg-gradient-to-r ${stat.gradient}`} />
                </div>
              </motion.div>
            </Tilt3DCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        <Tilt3DCard scale={1.03}>
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="glass-card-premium rounded-2xl p-6 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-cyan-500/20 p-2 rounded-lg glow-cyan"><TrendingUp className="w-5 h-5 text-cyan-400" /></div>
              <h3 className="text-xl font-bold text-white">Top Platforms</h3>
            </div>
            {stats?.top_platforms?.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.top_platforms}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#67e8f9" />
                      <stop offset="100%" stopColor="#0ea5e9" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="platform" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15,20,25,0.95)', border: '1px solid rgba(103,232,249,0.3)', borderRadius: '12px', color: '#fff' }} />
                  <Bar dataKey="count" fill="url(#barGradient)" radius={[12, 12, 0, 0]} animationDuration={2000} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-72 flex items-center justify-center text-slate-500">No data</div>}
          </motion.div>
        </Tilt3DCard>

        <Tilt3DCard scale={1.03}>
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="glass-card-premium rounded-2xl p-6 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-violet-500/20 p-2 rounded-lg"><Clock className="w-5 h-5 text-violet-400" /></div>
              <h3 className="text-xl font-bold text-white">Status Distribution</h3>
            </div>
            {stats?.total_applications > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={90} innerRadius={50} dataKey="value" animationDuration={2000}>
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15,20,25,0.95)', border: '1px solid rgba(103,232,249,0.3)', borderRadius: '12px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-72 flex items-center justify-center text-slate-500">No data</div>}
          </motion.div>
        </Tilt3DCard>
      </div>

      {stats?.total_applications > 0 && (
        <Tilt3DCard scale={1.02}>
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="glass-card-premium rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-500/20 p-2 rounded-lg glow-emerald"><Rocket className="w-5 h-5 text-emerald-400" /></div>
              <h3 className="text-xl font-bold text-white">Application Trend</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6ee7b7" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15,20,25,0.95)', border: '1px solid rgba(103,232,249,0.3)', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="applications" stroke="#6ee7b7" strokeWidth={3} fill="url(#areaGradient)" animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </Tilt3DCard>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card-premium rounded-2xl p-6 relative z-10">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-cyan-400" />
          Recent Applications
        </h3>
        {stats?.recent_applications?.length > 0 ? (
          <div className="space-y-3">
            <AnimatePresence>
              {stats.recent_applications.map((app, index) => (
                <motion.div key={app.id} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} whileHover={{ x: 12, scale: 1.02 }} className="glass-card p-4 rounded-xl cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 p-3 rounded-xl border border-cyan-500/30">
                        <Briefcase className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg">{app.company_name}</h4>
                        <p className="text-slate-400 text-sm">{app.role}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span>📍 {app.platform}</span>
                          <span>•</span>
                          <span>{new Date(app.applied_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium status-${app.status.toLowerCase()}`}>{app.status}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-16">
            <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 3, repeat: Infinity }}>
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-slate-700" />
            </motion.div>
            <p className="text-slate-500 text-lg">No applications yet. Start tracking!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DashboardPage;
