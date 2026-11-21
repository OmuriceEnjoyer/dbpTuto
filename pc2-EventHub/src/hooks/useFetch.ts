import {useState, useEffect} from 'react';

export function useFetch<T>(fetchFn: () => Promise<T>, deps: unknown[] = []) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        fetchFn()
            .then((response) => {
                if (!cancelled) {
                    setData(response);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });
    }, deps);

    return { data, loading, error };
}