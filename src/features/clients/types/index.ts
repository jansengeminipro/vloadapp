export interface ClientProgramForm {
    name: string;
    startDate: string;
    endDate: string;
    selectedIds: string[];
    schedule: Record<string, number[]>;
}
