import axios from 'axios';
import * as repl from "repl";

const BASE_URL = 'https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/evenements-publics-openagenda/records';

export const fetchEvents = async (limit = 10, offset = 0, sortByDate = '', locationFilter = '') => {
    try {
        const paramsWhere = [];
        if (sortByDate && locationFilter) {
            paramsWhere.push(`(keywords_fr LIKE '%${sortByDate}%' AND (location_city LIKE '%${locationFilter}%' OR location_name LIKE '%${locationFilter}%' OR location_address LIKE '%${locationFilter}%'))`);
        } else if (sortByDate) {
            paramsWhere.push(`keywords_fr LIKE '%${sortByDate}%'`);
        } else if (locationFilter) {
            paramsWhere.push(`(location_city LIKE '%${locationFilter}%' OR location_name LIKE '%${locationFilter}%' OR location_address LIKE '%${locationFilter}%')`);
        }

        const response = await axios.get(BASE_URL, {
            params: {
                limit,
                offset,
                where: paramsWhere.join(' OR '),
            }
        });
        let results = response.data.results;

        // Éliminer les doublons
        results = results.filter((event, index, self) =>
            index === self.findIndex((e) => (
                e.uid === event.uid
            ))
        );

        return results;
    } catch (error) {
        console.error("Erreur lors de la récupération des événements:", error);
        throw error;
    }
};




export const fetchEventDetails = async (eventId: string): Promise<Event> => {
    const response = await fetch(`https://public.opendatasoft.com/api/records/1.0/search/?dataset=evenements-publics-openagenda&refine.uid=${eventId}`);

    if (!response.ok) {
        throw new Error('Failed to fetch event details');
    }

    const data = await response.json();
    return data.records[0].fields;
};




