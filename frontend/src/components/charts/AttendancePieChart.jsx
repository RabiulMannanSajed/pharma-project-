import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { ATTENDANCE_STATUS_COLORS } from '../../utils/constants';

export const AttendancePieChart = ({ data = [], height = 240 }) => {
  const chartData = data.filter((d) => Number(d.value) > 0);
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-slate-400 dark:text-slate-500" style={{ height }}>
        No attendance data yet
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={50}
          paddingAngle={2}
          label={(d) => `${d.name}: ${d.value}`}
          labelLine={false}
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={ATTENDANCE_STATUS_COLORS[entry.name] || '#94a3b8'} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};