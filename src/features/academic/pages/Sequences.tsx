// src/features/academic/pages/Sequences.tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { PlusIcon, FilterIcon, Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { DataTable } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { StatusBadge } from '@/components/StatusBadge';
import { Sequence, PaginatedResponse, Term } from '@/types/academic';
import { sequenceApi, useCreateSequence, useUpdateSequence } from '../hooks/sequence';
import { termsApi } from '../hooks/terms';
import { Can } from '@/hooks/shared/useHasPermission';
import { useInstitutionConfig } from '@/hooks/shared/useInstitutionConfig';

function createSequenceSchema(termErrorMessage: string) {
    return z.object({
        name: z.string().min(3, 'Name must be at least 3 characters'),
        code: z.string().min(2, 'Code is required'),
        term: z.string().min(1, termErrorMessage),
        max_score: z.number().min(5, 'Max score must be at least 5'),
        is_mandatory: z.boolean(),
        is_current: z.boolean(),
        is_resit: z.boolean(),
        is_results_published: z.boolean(),
    });
}

export function Sequences() {
    const { getLabel, getPlural } = useInstitutionConfig();
    const termErrorMessage = `${getLabel('academic_period')} is required`;
    const sequenceSchema = createSequenceSchema(termErrorMessage);
    type FormData = z.infer<typeof sequenceSchema>;

    const [response, setResponse] = useState<PaginatedResponse<Sequence> | null>(null);
    const [terms, setTerms] = useState<Term[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTermId, setSelectedTermId] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Sequence | null>(null);
    const [itemToDelete, setItemToDelete] = useState<Sequence | null>(null);

    const currentTermId = useMemo(() => {
        const currentSeq = response?.data?.find((s: Sequence) => s.is_current);
        if (!currentSeq || !terms.length) return null;
        const matchingTerm = terms.find((t) => t.name === currentSeq.term);
        return matchingTerm ? String(matchingTerm.id) : null;
    }, [response, terms]);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
        watch,
    } = useForm<FormData>({
        resolver: zodResolver(sequenceSchema),
        defaultValues: {
            name: '',
            code: '',
            term: '',
            max_score: 20,
            is_mandatory: true,
            is_current: false,
            is_resit: false,
            is_results_published: false,
        },
    });

    const watchedIsMandatory = watch('is_mandatory');
    const watchedIsCurrent = watch('is_current');
    const watchedIsResit = watch('is_resit');
    const watchedIsResultsPublished = watch('is_results_published');

    const updateMutation = useUpdateSequence()
    const createMutation = useCreateSequence()

    // Fetch terms for dropdowns
    const fetchTerms = useCallback(async () => {
        try {
            const data = await termsApi.getAll('', 1, 100);
            setTerms(data.data);
        } catch (error) {
            console.error('Failed to fetch terms:', error);
        }
    }, []);

    // Server-side fetch with term filter
    const fetchSequences = useCallback(async () => {
        try {
            setLoading(true);
            const data = await sequenceApi.getAll(searchTerm, currentPage, pageSize, selectedTermId);
            setResponse(data);
        } catch (error) {
            console.error('Failed to fetch sequences:', error);
            toast.error('Failed to load sequences');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, currentPage, pageSize, selectedTermId]);

    useEffect(() => {
        fetchTerms();
    }, [fetchTerms]);

    useEffect(() => {
        fetchSequences();
    }, [fetchSequences]);

    const handleOpenModal = (item?: Sequence) => {
        if (item) {
            setEditingItem(item);
            setValue('name', item.name);
            setValue('code', item.code);
            const termId = terms.find((t) => t.name === item.term)?.id || item.term;
            setValue('term', String(termId));
            setValue('max_score', Number(item.max_score));
            setValue('is_mandatory', item.is_mandatory);
            setValue('is_current', item.is_current);
            setValue('is_resit', item.is_resit);
            setValue('is_results_published', item.is_results_published);
        } else {
            setEditingItem(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const onSubmit = async (formData: FormData) => {
        try {
            const payload = {
                ...formData,
                max_score: Number(formData.max_score),
            };

            if (editingItem?.id) {
                await updateMutation.mutateAsync({
                    id: editingItem.id,
                    payload,
                })
                toast.success('Sequence updated successfully');
            } else {
                await createMutation.mutateAsync ({
                    payload
                })
                toast.success('Sequence created successfully');
            }
            setIsModalOpen(false);
            fetchSequences();
        } catch (error: any) {
            console.error('Save error:', error);
            const serverData = error.response?.data;
            if (serverData?.non_field_errors?.length) {
                toast.error(serverData.non_field_errors[0]);
            } else if (serverData?.name) {
                toast.error(serverData.name[0]);
            } else if (serverData?.code) {
                toast.error(serverData.code[0]);
            } else if (serverData?.term) {
                toast.error(serverData.term[0]);
            } else {
                toast.error('Failed to save sequence. Please try again.');
            }
        }
    };

    const handleDelete = async () => {
        if (!itemToDelete?.id) return;
        try {
            await sequenceApi.delete(itemToDelete.id);
            toast.success('Sequence deleted successfully');
            fetchSequences();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to delete sequence');
        } finally {
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const tableResponse: PaginatedResponse<Sequence> = response ?? {
        data: [],
        pagination: {
            current_page: currentPage,
            page_size: pageSize,
            total_count: 0,
            total_pages: 1,
            has_next: false,
            has_previous: false,
        },
        search: { term: searchTerm, has_results: false },
        filters: {},
    };

    const columns = [
        { header: 'Name', accessor: 'name' as keyof Sequence },
        { header: 'Code', accessor: 'code' as keyof Sequence },
        {
            header: getPlural('academic_period'),
            accessor: (item: Sequence) => {
                const termObj = terms.find((t) => String(t.id) === String(item.term));
                return termObj ? termObj.name : item.term;
            },
        },
        { header: 'Max Score', accessor: 'max_score' as keyof Sequence },
        {
            header: 'Attributes',
            accessor: (item: Sequence) => (
                <div className="flex flex-wrap gap-1">
                    {item.is_mandatory ? <StatusBadge status="mandatory" /> : <StatusBadge status="optional" />}
                    {item.is_resit && <StatusBadge status="resit" />}
                </div>
            ),
        },
        {
            header: 'Status',
            accessor: (item: Sequence) => (
                <div className="flex flex-wrap gap-1">
                    {item.is_current && <StatusBadge status="current" />}
                    {item.is_results_published && <StatusBadge status="published" />}
                </div>
            ),
        },
        {
            header: 'Actions',
            accessor: (item: Sequence) => (
                <div className="flex items-center gap-2">
                    {!item.is_current && (
                        <Can permission="set_current.sequence">
                            <div>
                                {/* <button
                                    onClick={() => handleSetAsCurrent(item.id)}
                                    className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                                >
                                    Set as Current
                                </button> */}
                            </div>
                        </Can>
                    )}
                    <Can permission="change.sequence">
                        <button
                            onClick={() => handleOpenModal(item)}
                            className="text-xs px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                        >
                            Edit
                        </button>
                    </Can>
                    <Can permission="delete.sequence">
                        <button
                            onClick={() => {
                                setItemToDelete(item);
                                setIsDeleteModalOpen(true);
                            }}
                            className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                            Delete
                        </button>
                    </Can>
                </div>
            ),
        },
    ];

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Responsive Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#1a1a2e]">Sequences</h1>
                    <p className="text-slate-500 mt-1 text-sm">Manage evaluation sequences within {getPlural('academic_period')}.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1 sm:w-72">
                        <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            value={selectedTermId}
                            onChange={(e) => {
                                setSelectedTermId(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white appearance-none"
                        >
                            <option value="">All {getPlural('academic_period')}</option>
                            {terms.map((t) => {
                                const termIdStr = String(t.id);
                                const isCurrentTerm = currentTermId === termIdStr;
                                return (
                                    <option key={t.id} value={t.id}>
                                        {t.name}{isCurrentTerm ? ' (Current)' : ''}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <Can permission="add.sequence">
                        <button
                            onClick={() => handleOpenModal()}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm shadow-orange-500/20"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Add New
                        </button>
                    </Can>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <DataTable
                    data={tableResponse}
                    columns={columns}
                    onPageChange={setCurrentPage}
                    onSearch={(term) => {
                        setSearchTerm(term);
                        setCurrentPage(1);
                    }}
                    searchTerm={searchTerm}
                    onEdit={handleOpenModal}
                    onDelete={(item) => {
                        setItemToDelete(item);
                        setIsDeleteModalOpen(true);
                    }}
                    loading={loading}
                    actions={false}
                />
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? 'Edit Sequence' : 'Add Sequence'}
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                            <input {...register('name')} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
                            <input {...register('code')} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" />
                            {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
                        </div>

                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1">
                                {getLabel('academic_period')}
                                <span
                                    className="cursor-help"
                                    title="Term is auto-set to the current one. You can only create/update sequences for the current term."
                                >
                                    <Info className="w-3.5 h-3.5 text-amber-500" />
                                </span>
                            </label>
                            <select
                                {...register('term')}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                            >
                                <option value="">Select {getLabel('academic_period')}</option>
                                {terms.map((t) => {
                                    const termIdStr = String(t.id);
                                    const isCurrentTerm = currentTermId === termIdStr;
                                    const disabledForCreate = !editingItem && currentTermId !== null && !isCurrentTerm;
                                    return (
                                        <option
                                            key={t.id}
                                            value={t.id}
                                            disabled={disabledForCreate}
                                        >
                                            {t.name}{isCurrentTerm ? ' (Current)' : ''}
                                        </option>
                                    );
                                })}
                            </select>
                            {errors.term && <p className="text-red-500 text-xs mt-1">{errors.term.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Max Score</label>
                            <input
                                type="number"
                                {...register('max_score', { valueAsNumber: true })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            />
                            {errors.max_score && <p className="text-red-500 text-xs mt-1">{errors.max_score.message}</p>}
                        </div>
                    </div>

                    {/* ANIMATED TOGGLES (exactly like Terms page) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                        {/* Mandatory */}
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div>
                                <div className="font-medium text-slate-700">Mandatory</div>
                                <div className="text-xs text-slate-500">This sequence is required for all students</div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setValue('is_mandatory', !watchedIsMandatory)}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${watchedIsMandatory ? 'bg-orange-500' : 'bg-slate-200'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${watchedIsMandatory ? 'translate-x-5' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Current (permission protected) */}
                        <Can permission="set_current.sequence">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div>
                                    <div className="font-medium text-slate-700">Current</div>
                                    <div className="text-xs text-slate-500">This is the active sequence</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setValue('is_current', !watchedIsCurrent)}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${watchedIsCurrent ? 'bg-orange-500' : 'bg-slate-200'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${watchedIsCurrent ? 'translate-x-5' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        </Can>

                        {/* Resit Sequence */}
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div>
                                <div className="font-medium text-slate-700">Resit Sequence</div>
                                <div className="text-xs text-slate-500">This sequence is for resit students only</div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setValue('is_resit', !watchedIsResit)}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${watchedIsResit ? 'bg-orange-500' : 'bg-slate-200'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${watchedIsResit ? 'translate-x-5' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Results Published */}
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div>
                                <div className="font-medium text-slate-700">Results Published</div>
                                <div className="text-xs text-slate-500">Students can view their results</div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setValue('is_results_published', !watchedIsResultsPublished)}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${watchedIsResultsPublished ? 'bg-orange-500' : 'bg-slate-200'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${watchedIsResultsPublished ? 'translate-x-5' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                        <Can permission='change.sequence'><button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors shadow-sm shadow-orange-500/20">Save Changes</button></Can>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Deletion"
            >
                <div className="space-y-4">
                    <p className="text-slate-600">
                        Are you sure you want to delete the sequence{' '}
                        <span className="font-semibold text-slate-800">{itemToDelete?.name}</span>? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                        <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm shadow-red-500/20">Delete</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}