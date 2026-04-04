// src/app/layout/DashboardOverview.tsx
import { motion } from 'framer-motion';
import { Users, GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useHasPermission, Can } from '@/hooks/shared/useHasPermission';

const stats = [
  { title: 'Total Students', value: '2,845', change: '+12.5%', isPositive: true, icon: Users },
  { title: 'Average Attendance', value: '94.2%', change: '+1.2%', isPositive: true, icon: CheckCircle2 },
  { title: 'Active Classes', value: '142', change: '0%', isPositive: true, icon: GraduationCap },
  { title: 'Pending Reports', value: '18', change: '-5', isPositive: false, icon: AlertCircle },
]

const recentActivity = [
  { user: 'Sarah Jenkins', action: 'uploaded term 2 marks for', target: 'Grade 10 Science', time: '10 mins ago', avatar: 'SJ' },
  { user: 'David Chen', action: 'updated attendance record for', target: 'Class 8-B', time: '1 hour ago', avatar: 'DC' },
];

export function DashboardOverview() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-heading">Welcome back, John</h1>
          <p className="text-gray-500">Here's what's happening across your institution today.</p>
        </div>

        <Can permission="marks.upload">
          <Button className="bg-orange-600 hover:bg-orange-700">Upload Marks</Button>
        </Can>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <h3 className="text-3xl font-bold">{stat.value}</h3>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
                <stat.icon size={28} className="text-orange-600" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity - only visible to users with permission */}
      <Can permission="view.activity">
        <Card className="p-6">
          <h3 className="font-semibold mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex gap-4">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{item.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm">
                    <span className="font-medium">{item.user}</span> {item.action} <span className="font-medium">{item.target}</span>
                  </p>
                  <p className="text-xs text-gray-400">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Can>
    </motion.div>
  );
}