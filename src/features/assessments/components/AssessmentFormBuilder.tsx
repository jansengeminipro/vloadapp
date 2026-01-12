import React from 'react';
import { FormField } from '../domain/models';

interface AssessmentFormBuilderProps {
    schema: FormField[];
    values: Record<string, any>;
    onChange: (name: string, value: any) => void;
}

const AssessmentFormBuilder: React.FC<AssessmentFormBuilderProps> = ({ schema, values, onChange }) => {
    // Group fields by their 'group' property
    const groupedFields = schema.reduce((acc, field) => {
        const group = field.group || 'Geral';
        if (!acc[group]) acc[group] = [];
        acc[group].push(field);
        return acc;
    }, {} as Record<string, FormField[]>);

    return (
        <div className="space-y-6">
            {Object.entries(groupedFields).map(([groupName, fields]) => (
                <div key={groupName} className="space-y-3">
                    <h5 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1">{groupName}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(fields as FormField[]).map(field => (
                            <div key={field.name} className="space-y-1">
                                <label className="block text-xs font-semibold text-slate-300">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>
                                <div className="relative">
                                    <input
                                        type={field.type === 'number' ? 'number' : 'text'}
                                        value={values[field.name] || ''}
                                        onChange={(e) => onChange(field.name, field.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                                        placeholder={field.placeholder}
                                        min={field.min}
                                        max={field.max}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:border-primary-500 focus:outline-none transition-colors"
                                    />
                                    {field.unit && (
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">
                                            {field.unit}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AssessmentFormBuilder;
