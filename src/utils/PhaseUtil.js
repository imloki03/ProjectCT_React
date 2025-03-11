import {getAllPhases} from "../api/phaseApi";

export function sortPhaseByStartDate(phases) {
    phases.sort((a, b) => {
        const dateA = new Date(a.startDate);
        const dateB = new Date(b.startDate);
        return dateA - dateB;
    });
    return phases;
}

const getAllPhasesKeyValue = async (projectId) => {
    try {
        const allPhases = await getAllPhases(projectId);
        const phases = sortPhaseByStartDate(allPhases.data)
        return phases.map(phase => ({
            label: phase.name,
            value: phase.id
        }));
    } catch (error) {
        console.error('Failed to load phases:', error);
    }
};
export default getAllPhasesKeyValue;