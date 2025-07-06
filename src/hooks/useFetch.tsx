import Papa from 'papaparse';
import { RowData } from '../../public/data/types';



type Callback = (data: RowData[]) => void;

const useFetch = () => {

    // Accepts array of objects with string keys and string|number|null values
    const sanitizeColumns = (data: Array<Record<string, unknown>>): Array<Record<string, unknown>> => {
        return data.map((item: Record<string, unknown>) => {
            const sanitizedItem: Record<string, unknown> = {};
            Object.keys(item).forEach(key => {
                const sanitizedKey = key.replace(/(\s|-)+/g, '_');
                sanitizedItem[sanitizedKey] = item[key];
            });
            return sanitizedItem;
        });
    };

    const fetchCsvData = async (filePath: string, callback: Callback) => {
        const response = await fetch(filePath);
        const reader = response.body!.getReader();
        const result = await reader.read();
        const decoder = new TextDecoder('utf-8');
        const csvString = decoder.decode(result.value!);
        const { data } = Papa.parse<Record<string, unknown>>(csvString, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
        });
        const sanitizedData = sanitizeColumns(data);
        callback(sanitizedData as RowData[]);
    };

    return { fetchCsvData };

};

export default useFetch;