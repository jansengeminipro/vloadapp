import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/shared/lib/supabase';
import { Client } from '@/shared/types';
import { Activity, Search, Users, CheckCircle, ChevronRight, ChevronLeft, LayoutList } from 'lucide-react';
import { AssessmentFactory, AVAILABLE_TESTS, TEST_CATEGORIES } from '../domain/strategies';
import AssessmentFormBuilder from '../components/AssessmentFormBuilder';
import { saveAssessment } from '../api/assessmentsRepository';
import { Assessment, AnalysisResult } from '../domain/models';

type Step = 'select-client' | 'select-tests' | 'execute';

const AssessmentsPage: React.FC = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('select-client');
    const [clients, setClients] = useState<Client[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [selectedTests, setSelectedTests] = useState<string[]>([]);

    // Execution State
    const [currentTestIndex, setCurrentTestIndex] = useState(0);
    const [formsData, setFormsData] = useState<Record<string, any>>({});
    const [results, setResults] = useState<Record<string, AnalysisResult>>({});
    const [saving, setSaving] = useState(false);

    // Load Clients
    useEffect(() => {
        if (!user) return;
        const loadClients = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('trainer_id', user.id)
                .eq('role', 'student');

            if (data) {
                const mapped = data.map((p: any) => ({
                    id: p.id,
                    name: p.full_name || 'Sem Nome',
                    email: p.email,
                    avatarUrl: p.avatar_url,
                    birthDate: p.birth_date,
                    birth_date: p.birth_date, // Strategy compatibility
                    gender: p.gender,
                    weight: p.weight,
                    height: p.height
                }));
                setClients(mapped);
            }
        };
        loadClients();
    }, [user]);

    // Auto-select client from URL if available
    useEffect(() => {
        const clientIdParam = searchParams.get('clientId');
        if (clientIdParam && clients.length > 0 && !selectedClient) {
            const foundClient = clients.find(c => c.id === clientIdParam);
            if (foundClient) {
                handleClientSelect(foundClient);
            }
        }
    }, [clients, searchParams]);

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleClientSelect = (client: Client) => {
        setSelectedClient(client);
        setStep('select-tests');
    };

    const toggleTest = (testId: string) => {
        setSelectedTests(prev =>
            prev.includes(testId) ? prev.filter(id => id !== testId) : [...prev, testId]
        );
    };

    const startBattery = () => {
        if (selectedTests.length === 0 || !selectedClient) return;

        // Auto-fill form data from client profile
        const initialData: Record<string, any> = {};
        selectedTests.forEach(testId => {
            initialData[testId] = {
                weight_kg: selectedClient.weight,
                height_cm: selectedClient.height,
            };
        });

        setCurrentTestIndex(0);
        setFormsData(initialData);
        setResults({});
        setStep('execute');
    };

    const handleCalculateCurrent = () => {
        const testId = selectedTests[currentTestIndex];
        const strategy = AssessmentFactory.getStrategy(testId);
        const data = formsData[testId] || {};

        try {
            if (!strategy.validate(data)) {
                alert('Preencha os campos obrigatórios.');
                return;
            }
            const result = strategy.calculateResults(data, selectedClient);
            setResults(prev => ({ ...prev, [testId]: result }));
        } catch (e) {
            alert('Erro ao calcular: ' + e);
        }
    };

    const handleNext = async () => {
        // If it's the last test, save all
        if (currentTestIndex === selectedTests.length - 1) {
            await saveAll();
        } else {
            setCurrentTestIndex(prev => prev + 1);
        }
    };

    const saveAll = async () => {
        if (!selectedClient || !user) return;
        setSaving(true);
        try {
            // Save each test individually for granular history
            // Ideally we'd wrap this in a transaction or "Session" object, but per simplified schema:
            const date = new Date().toISOString().split('T')[0];

            for (const testId of selectedTests) {
                const result = results[testId];
                if (!result) continue; // Skip if not calculated? Or force calc? Assuming calc is done.

                const payload: Partial<Assessment> = {
                    client_id: selectedClient.id,
                    coach_id: user.id,
                    date: date,
                    type: testId as any,
                    data: {
                        ...formsData[testId],
                        _result: result
                    }
                };
                await saveAssessment(payload);
            }
            alert('Bateria salva com sucesso!');
            // Reset
            setStep('select-client');
            setSelectedClient(null);
            setSelectedTests([]);
            setFormsData({});
            setResults({});
        } catch (e) {
            console.error(e);
            alert('Erro ao salvar avaliações.');
        } finally {
            setSaving(false);
        }
    };

    // --- RENDER STEPS ---

    if (step === 'select-client') {
        return (
            <div className="p-8 max-w-5xl mx-auto">
                <div className="flex items-center gap-3 mb-2">
                    <button onClick={() => navigate(-1)} className="p-1 -ml-2 text-surface-400 hover:text-white transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3 font-display tracking-tight">
                        <Activity className="text-primary-500" /> Nova Avaliação
                    </h1>
                </div>
                <p className="text-surface-400 mb-8 ml-8">Selecione o aluno para iniciar um teste ou bateria de testes.</p>

                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar aluno..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-surface-900 border border-white/5 rounded-xl py-3 pl-10 text-white focus:border-primary-500 focus:outline-none placeholder-surface-600 focus:ring-1 focus:ring-primary-500 transition-all"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredClients.map(client => (
                        <button
                            key={client.id}
                            onClick={() => handleClientSelect(client)}
                            className="flex items-center gap-4 p-4 bg-surface-800 border border-white/5 rounded-xl hover:border-primary-500/50 hover:bg-surface-800 hover:shadow-lg hover:shadow-primary-500/5 transition-all group text-left hover:-translate-y-1 duration-200"
                        >
                            <div className="w-12 h-12 rounded-full bg-surface-700 flex items-center justify-center text-surface-300 font-bold group-hover:bg-primary-500/20 group-hover:text-primary-500 transition-colors border border-surface-600">
                                {client.avatarUrl ? (
                                    <img src={client.avatarUrl} alt={client.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    client.name.substring(0, 2).toUpperCase()
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-white group-hover:text-primary-400 transition-colors font-display">{client.name}</h3>
                                <div className="text-xs text-surface-500">Último treino: {client.lastWorkout || '-'}</div>
                            </div>
                            <ChevronRight className="ml-auto text-surface-600 group-hover:translate-x-1 transition-transform group-hover:text-primary-500" />
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (step === 'select-tests') {
        return (
            <div className="p-8 max-w-5xl mx-auto">
                <button
                    onClick={() => {
                        if (searchParams.get('clientId')) {
                            navigate(-1);
                        } else {
                            setStep('select-client');
                        }
                    }}
                    className="text-sm text-surface-500 hover:text-white mb-6 flex items-center gap-1 transition-colors"
                >
                    <ChevronLeft size={14} /> {searchParams.get('clientId') ? 'Voltar ao Perfil' : 'Voltar (Seleção de Aluno)'}
                </button>

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-500 font-bold text-xl">
                        {(selectedClient?.name?.substring(0, 2) || '??').toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white font-display tracking-tight">Montar Bateria</h2>
                        <p className="text-surface-400">Quais testes {selectedClient?.name ? selectedClient.name.split(' ')[0] : 'o aluno'} fará hoje?</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {TEST_CATEGORIES.map(cat => {
                        const tests = AVAILABLE_TESTS.filter(t => t.category === cat.id);
                        if (tests.length === 0) return null;
                        return (
                            <div key={cat.id} className="bg-surface-900/50 border border-white/5 rounded-xl p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-primary-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <LayoutList size={16} /> {cat.label}
                                </h3>
                                <div className="space-y-2">
                                    {tests.map(test => {
                                        const isSelected = selectedTests.includes(test.id);
                                        return (
                                            <button
                                                key={test.id}
                                                onClick={() => toggleTest(test.id)}
                                                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${isSelected
                                                    ? 'bg-primary-500/10 border-primary-500/50 text-white shadow-md shadow-primary-500/5'
                                                    : 'bg-surface-950 border-white/5 text-surface-400 hover:border-surface-600 hover:text-surface-200'
                                                    }`}
                                            >
                                                <span className="font-medium text-sm">{test.label}</span>
                                                {isSelected && <CheckCircle size={18} className="text-primary-500" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 flex justify-end pt-6 border-t border-white/5">
                    <button
                        onClick={startBattery}
                        disabled={selectedTests.length === 0}
                        className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg shadow-primary-500/20 flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 duration-200"
                    >
                        Iniciar Bateria ({selectedTests.length}) <ChevronRight />
                    </button>
                </div>
            </div>
        );
    }

    // Execution Step
    const currentTestId = selectedTests[currentTestIndex];
    if (!currentTestId) return <div>Erro: Nenhum teste selecionado.</div>; // Guard clause

    const strategy = AssessmentFactory.getStrategy(currentTestId);
    const schema = strategy.getFormSchema();
    const currentResult = results[currentTestId];

    return (

        <div className="p-6 md:p-8 max-w-4xl mx-auto h-screen flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="text-xs font-bold text-surface-500 uppercase mb-1">
                        Teste {currentTestIndex + 1} de {selectedTests.length}
                    </div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3 font-display tracking-tight">
                        {strategy.getTitle()}
                    </h2>
                </div>
                <div className="bg-surface-900 px-4 py-2 rounded-full border border-white/5">
                    <span className="text-surface-400 text-sm font-medium">{selectedClient?.name}</span>
                </div>
            </div>

            <div className="flex-1 bg-surface-900 border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl overflow-y-auto">
                <AssessmentFormBuilder
                    schema={schema}
                    values={formsData[currentTestId] || {}}
                    onChange={(name, val) => setFormsData(prev => ({
                        ...prev,
                        [currentTestId]: { ...(prev[currentTestId] || {}), [name]: val }
                    }))}
                />

                {/* Results Display Interface within execution */}
                {currentResult && (
                    <div className="mt-8 p-6 bg-surface-950 rounded-xl border border-white/5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-500 border border-emerald-500/20">
                                <Activity size={20} />
                            </div>
                            <div>
                                <div className="text-xs text-surface-500 uppercase font-bold">Classificação</div>
                                <div className="text-xl font-black text-white font-display">{currentResult.classification}</div>
                            </div>
                            <div className="ml-auto text-right">
                                <div className="text-xs text-surface-500 uppercase font-bold">Score</div>
                                <div className="text-xl font-black text-primary-500 font-display">{currentResult.score}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6 flex justify-between items-center bg-surface-950 p-4 border-t border-white/5 sticky bottom-0 z-20">
                {!currentResult ? (
                    <button
                        onClick={handleCalculateCurrent}
                        className="bg-surface-800 hover:bg-surface-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 w-full md:w-auto hover:text-primary-400 border border-white/5"
                    >
                        Calcular
                    </button>
                ) : (
                    <div className="flex gap-4 w-full justify-end">
                        <button
                            onClick={() => {
                                setResults(prev => {
                                    const next = { ...prev };
                                    delete next[currentTestId];
                                    return next;
                                });
                            }}
                            className="bg-surface-800 hover:bg-surface-700 text-surface-300 px-6 py-3 rounded-xl font-medium transition-colors border border-white/5"
                        >
                            Recalcular
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={saving}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 hover:scale-105 active:scale-95 duration-200"
                        >
                            {saving ? 'Salvando...' : currentTestIndex < selectedTests.length - 1 ? 'Próximo Teste' : 'Finalizar Bateria'}
                            {!saving && <ChevronRight size={18} />}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssessmentsPage;
