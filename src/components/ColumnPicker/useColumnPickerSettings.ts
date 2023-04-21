import useLocalStorage from "@dashboard/hooks/useLocalStorage";

const COLUMN_PICKER_KEY = "columnPickerConfig";

export type DatagridViews = "PRODUCT_LIST" | "PRODUCT_DETAILS" | "ORDER_LIST";

type CustomColumnSettings = {
  [view in DatagridViews]: string[];
};

export const defaultCustomColumns: CustomColumnSettings = {
  PRODUCT_LIST: [],
  PRODUCT_DETAILS: [],
  ORDER_LIST: [],
};

export const useCustomColumnSettings = (view: DatagridViews) => {
  const [config, setConfig] = useLocalStorage(
    COLUMN_PICKER_KEY,
    defaultCustomColumns,
  );

  const setCustomColumnsSettings = (cols: string[]) =>
    setConfig(currentSettings => ({
      ...currentSettings,
      [view]: cols,
    }));

  const customColumnsSettings = config[view];

  return { customColumnsSettings, setCustomColumnsSettings };
};
