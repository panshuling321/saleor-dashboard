import useStateFromProps from "@dashboard/hooks/useStateFromProps";
import { addAtIndex, removeAtIndex } from "@dashboard/utils/lists";
import { GridColumn } from "@glideapps/glide-data-grid";
import { useCallback, useMemo, useState } from "react";

import { AvailableColumn } from "../types";

export function useColumnsDefault(
  availableColumns: readonly AvailableColumn[],
) {
  const [query, setQuery] = useState("");
  const [displayedColumns, setDisplayedColumns] = useStateFromProps(
    availableColumns.map(({ id }) => id),
  );
  const [columnState, setColumnState] = useStateFromProps(availableColumns);

  const onColumnMoved = useCallback(
    (startIndex: number, endIndex: number): void => {
      // When empty column prevent to rearange it order
      if (availableColumns[0]?.id === "empty") {
        if (startIndex === 0) {
          return setDisplayedColumns(prevColumns => [...prevColumns]);
        }

        // Keep empty column always at beginning
        if (endIndex === 0) {
          return setDisplayedColumns(old =>
            addAtIndex(
              old[startIndex],
              removeAtIndex(old, startIndex),
              endIndex + 1,
            ),
          );
        }
      }

      setDisplayedColumns(old =>
        addAtIndex(old[startIndex], removeAtIndex(old, startIndex), endIndex),
      );
    },
    [availableColumns, setDisplayedColumns],
  );
  const onColumnResize = useCallback(
    (column: GridColumn, newSize: number) =>
      setColumnState(prevColumns =>
        prevColumns.map(prevColumn =>
          prevColumn.id === column.id
            ? { ...prevColumn, width: newSize }
            : prevColumn,
        ),
      ),
    [setColumnState],
  );
  const onColumnsChange = useCallback(
    (picked: string[]) =>
      setDisplayedColumns(prevColumns => [
        ...prevColumns.filter(column => picked.includes(column)),
        ...picked
          .filter(column => !prevColumns.find(c => c === column))
          .map(column => availableColumns.find(ac => ac.id === column).id),
      ]),
    [availableColumns, setDisplayedColumns],
  );

  const columns = useMemo(
    () => displayedColumns.map(id => columnState.find(ac => ac.id === id)),
    [displayedColumns, columnState],
  );
  const columnChoices = useMemo(
    () =>
      columns.filter(byNoEmptyColumn).map(({ id, title }) => ({
        label: title,
        value: id,
      })),
    [columns],
  );
  const availableColumnsChoices = useMemo(
    () =>
      availableColumns.filter(byNoEmptyColumn).map(({ id, title }) => ({
        label: title,
        value: id,
      })),
    [availableColumns],
  );
  const defaultColumns = useMemo(
    () => availableColumns.filter(byNoEmptyColumn).map(({ id }) => id),
    [availableColumns],
  );

  return {
    availableColumnsChoices,
    columns,
    columnChoices,
    defaultColumns,
    displayedColumns,
    onColumnMoved,
    onColumnResize,
    onColumnsChange,
    picker: {
      query,
      setQuery,
    },
  };
}

function byNoEmptyColumn(column: AvailableColumn) {
  return column.id !== "empty";
}
