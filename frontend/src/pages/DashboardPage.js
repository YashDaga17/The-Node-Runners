import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../App';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Briefcase, Users, CheckCircle, XCircle, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Applications',
      value: stats?.total_applications || 0,
      icon: Briefcase,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
    {
      title: 'Interviews',
      value: stats?.interviews || 0,
      icon: Users,
      color: 'violet',
      bgColor: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
    {
      title: 'Offers',
      value: stats?.offers || 0,
      icon: CheckCircle,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Rejections',
      value: stats?.rejections || 0,
      icon: XCircle,
      color: 'rose',
      bgColor: 'bg-rose-50',
      iconColor: 'text-rose-600',
    },
  ];

  const pieData = [
    { name: 'Applied', value: stats?.pending || 0, color: '#6366f1' },
    { name: 'Interview', value: stats?.interviews || 0, color: '#8b5cf6' },
    { name: 'Offer', value: stats?.offers || 0, color: '#10b981' },
    { name: 'Rejected', value: stats?.rejections || 0, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Overview of your job application journey</p>
      </div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              data-testid={`stat-card-${stat.title.toLowerCase().replace(' ', '-')}`}
            >
              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-xl`}>
                      <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Chart */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Top Platforms
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.top_platforms?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.top_platforms}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="platform" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-72 flex items-center justify-center text-slate-500">
                <p>No application data yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.total_applications > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-72 flex items-center justify-center text-slate-500">
                <p>No application data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recent_applications?.length > 0 ? (
            <div className="space-y-4">
              {stats.recent_applications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                  data-testid={`recent-app-${app.id}`}
                >
                  <div>
                    <h3 className="font-semibold text-slate-900">{app.company_name}</h3>
                    <p className="text-sm text-slate-600">{app.role}</p>
                    <p className="text-xs text-slate-500 mt-1">{app.platform}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        app.status === 'Offer'
                          ? 'bg-emerald-100 text-emerald-700'
                          : app.status === 'Interview'
                          ? 'bg-violet-100 text-violet-700'
                          : app.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {app.status}
                    </span>
                    <p className="text-xs text-slate-500 mt-2">
                      {new Date(app.applied_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Briefcase className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No applications yet. Start tracking your job applications!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
