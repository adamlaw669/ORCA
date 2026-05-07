'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface Props {
  data: Array<{ hour: string; count: number }>;
  height?: number;
  color?: string;
}

export default function Sparkline({ data, height = 80, color = '#FACC15' }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <XAxis dataKey="hour" hide />
        <YAxis hide />
        <Tooltip
          cursor={{ stroke: '#404040' }}
          contentStyle={{
            background: '#0A0A0A',
            border: '1px solid #262626',
            borderRadius: 6,
            fontSize: 12,
            fontFamily: 'DM Mono, monospace',
            color: '#FAFAFA',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
          labelStyle={{ color: '#A3A3A3' }}
        />
        <Line type="monotone" dataKey="count" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
