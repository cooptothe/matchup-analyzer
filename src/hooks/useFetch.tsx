import Papa from 'papaparse';
import { RowData } from '../../public/data/types';



type Callback = (data: RowData[]) => void;

const useFetch = () => {

    const sanitizeColumns = (data: any) => {
        return data.map((item: any) => {
            const sanitizedItem: any = {};
            Object.keys(item).forEach(key => {
                const sanitizedKey = key.replace(/(\s|-)+/g , '_');
                sanitizedItem[sanitizedKey] = item[key];
            })
            return sanitizedItem
        })
    }

    const fetchCsvData = async (filePath: string, callback: Callback) => {
        const response = await fetch(filePath);
        const reader = response.body!.getReader();
        const result = await reader.read();
        const decoder = new TextDecoder('utf-8');
        const csvString = decoder.decode(result.value!);
        const { data } = Papa.parse(csvString, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
        })
        const sanitizedData = sanitizeColumns(data);
        callback(sanitizedData as RowData[]);
    }

    return { fetchCsvData }

}

export default useFetch;