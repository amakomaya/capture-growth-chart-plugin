import { useQuery } from 'react-query';
import { useDataEngine } from '@dhis2/app-runtime';
import { useMemo } from 'react';
import { convertDataElementToValues } from '../Convert';
import { ServerEvent } from '../../../types/Event.types';

type UseEventsByProgramStageProps = {
    programStageId: string | undefined;
    orgUnitId: string | undefined;
    programId: string | undefined;
    teiId: string | undefined;
};

export type DataValue = {
    [key: string]: string | number;
};

export interface Event {
    dataValues: DataValue[];
    occurredAt: string;
    event: string;
    program: string;
    programStage: string;
    status: 'ACTIVE' | 'COMPLETED';
}

interface UseEventsByProgramStageReturn {
    events: Event[] | undefined;
    isLoading: boolean;
    isError: boolean;
    stageHasEvents: boolean;
}

export const useEventsByProgramStage = ({
    orgUnitId,
    programId,
    programStageId,
    teiId,
}: UseEventsByProgramStageProps): UseEventsByProgramStageReturn => {
    const dataEngine = useDataEngine();
    const {
        data,
        isLoading,
        isError,
    } = useQuery(['eventsByProgramStage', orgUnitId, programStageId, programId, teiId], (): any => dataEngine.query({
        eventsByProgramStage: {
            resource: 'tracker/events',
            params: ({
                orgUnitId,
                programStageId,
                programId,
                teiId,
            }) => ({
                fields: 'event,status,program,dataValues,occurredAt,programStage',
                program: programId,
                programStage: programStageId,
                orgUnit: orgUnitId,
                trackedEntity: teiId,
            }),
        },
    }, {
        variables: {
            orgUnitId,
            programStageId,
            programId,
            teiId,
        },
    }), { staleTime: 5000 });

    const events = useMemo(() => data?.eventsByProgramStage?.instances?.map((event: ServerEvent) => {
        const dataValues = convertDataElementToValues(event?.dataValues);
        return {
            ...event,
            dataValues,
        };
    }), [data]);

    const stageHasEvents = useMemo(() => events?.length !== 0, [events]);

    return {
        events,
        isLoading,
        isError,
        stageHasEvents,
    };
};
