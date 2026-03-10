import { useEffect, useRef } from "react";

export const useDebounce = (
    callback: (value: string) => void,
    delay = 500,
) => {
    const timeoutRef = useRef<NodeJS.Timeout>();

    const debouncedSearch = (value: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            callback(value);
        }, delay);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return debouncedSearch;
};
