import { useEffect, useRef } from "react";

export const useKeepPreviousData = <T>(data?: T[]): T[] => {
  const allData = useRef<T[]>([]);

  useEffect(() => {
    if (data) {
      allData.current = [...allData.current, ...data];
    }
  }, [data]);

  return allData.current;
};
