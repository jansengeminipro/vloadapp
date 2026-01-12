import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, AlertTriangle, Lightbulb, TrendingUp, Users } from 'lucide-react';
import { Alert, MuscleGroup } from '@/shared/types';

const data = [
  { name: 'Peitoral', volume: 42 },
  { name: 'Costas', volume: 55 },
  { name: 'Quadríceps', volume: 60 },
  { name: 'Posteriores', volume: 30 },
  { name: 'Ombros', volume: 38 },
  { name: 'Tríceps', volume: 22 },
  { name: 'Bíceps', volume: 24 },
];

const alerts: Alert[] = [
  { id: '1', type: 'pr', clientId: 'c1', clientName: 'Sarah J.', message: 'Novo PR no Levantamento Terra: 140kg x 3', date: '2h atrás' },
  { id: '2', type: 'stagnation', clientId: 'c2', clientName: 'Mike R.', message: 'Volume de Supino inalterado por 4 semanas', date: '5h atrás' },
  { id: '3', type: 'optimization', clientId: 'c2', clientName: 'Mike R.', message: 'Sugestão: +20% volume para Peitoral (Platô de adaptação)', date: '5h atrás' },
  { id: '4', type: 'pr', clientId: 'c3', clientName: 'Jessica T.', message: 'Aumento na precisão do RIR no Agachamento', date: '1d atrás' },
];

const Dashboard: React.FC = () => {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Painel de Controle</h1>
        <p className="text-slate-400">Visão geral do desempenho dos alunos e métricas de volume.</p>
      </header>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Alunos Ativos</p>
              <h3 className="text-3xl font-bold text-white">24</h3>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-emerald-500 font-medium">8 treinaram hoje</span>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Volume Semanal</p>
              <h3 className="text-3xl font-bold text-white">1,240 <span className="text-base font-normal text-slate-500">séries</span></h3>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
              <TrendingUp size={20} />
            </div>
          </div>
           <div className="mt-4 flex items-center text-sm">
            <span className="text-emerald-500 font-medium">+12%</span>
            <span className="text-slate-500 ml-1">vs semana anterior</span>
          </div>
        </div>
        
        {/* Placeholder for other high level stats */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm flex flex-col justify-center items-center text-slate-500">
           <span className="text-sm">Taxa de Retenção</span>
           <span className="text-2xl font-bold text-white">98%</span>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm flex flex-col justify-center items-center text-slate-500">
           <span className="text-sm">Conformidade</span>
           <span className="text-2xl font-bold text-white">92%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-white mb-6">Distribuição Global de Volume Semanal</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#334155', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                />
                <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                   {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.volume > 50 ? '#3b82f6' : '#60a5fa'} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Feed */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm flex flex-col h-full">
          <h2 className="text-xl font-semibold text-white mb-4">Alertas de Progressão</h2>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 p-1.5 rounded-full shrink-0 
                    ${alert.type === 'pr' ? 'bg-amber-500/10 text-amber-500' : 
                      alert.type === 'stagnation' ? 'bg-red-500/10 text-red-500' : 
                      'bg-blue-500/10 text-blue-500'}`}>
                    {alert.type === 'pr' && <Trophy size={16} />}
                    {alert.type === 'stagnation' && <AlertTriangle size={16} />}
                    {alert.type === 'optimization' && <Lightbulb size={16} />}
                  </div>
                  <div>
                    <div className="flex justify-between items-center w-full">
                      <h4 className="text-sm font-semibold text-white">{alert.clientName}</h4>
                      <span className="text-xs text-slate-500">{alert.date}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {alert.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;