import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Client } from '@/shared/types';
import { useAuth } from '@/app/providers/AuthProvider';
import { getClients } from '@/features/clients/api/clientService';
import { ClientFilters } from '../components/ClientFilters';
import { ClientList } from '../components/ClientList';
import { InviteClientModal } from '../components/InviteClientModal';

const Clients: React.FC = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        const data = await getClients(user.id);
        setClients(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white font-display tracking-tight">Alunos</h1>
          <p className="text-surface-400">Gerencie seus alunos ativos.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg shadow-primary-500/20 hover:scale-105 active:scale-95"
        >
          <Plus size={20} />
          Convidar Aluno
        </button>
      </div>

      <div className="bg-surface-800/50 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden shadow-sm">
        <ClientFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        <ClientList
          clients={filteredClients}
          loading={loading}
          searchTerm={searchTerm}
        />
      </div>

      {user && (
        <InviteClientModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          trainerId={user.id}
          onUserCreated={fetchClients}
        />
      )}
    </div>
  );
};

export default Clients;