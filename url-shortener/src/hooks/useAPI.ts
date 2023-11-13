import { useState, useEffect } from 'react';

interface ApiResponse {
    data: any;
    isLoading: boolean;
    error: Error | null;
}

const useAPI = (url: string): ApiResponse => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`Request failed with status: ${response.status}`);
                }

                const jsonData = await response.json();
                setData(jsonData);
                setIsLoading(false);
            } catch (err: any) {
                setError(err);
                setIsLoading(false);
            }
        };

        fetchData();
    }, [url]);

    return { data, isLoading, error };
};

export default useAPI;
