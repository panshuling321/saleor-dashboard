import {
  NumberCell,
  numberCellEmptyValue,
} from "@dashboard/components/Datagrid/customCells/NumberCell";
import { Locale } from "@dashboard/components/Locale";
import { GridCell, GridCellKind } from "@glideapps/glide-data-grid";

import {
  DropdownCell,
  DropdownCellContentProps,
  DropdownChoice,
} from "./DropdownCell";
import { MoneyCell } from "./MoneyCell";
import { ThumbnailCell } from "./ThumbnailCell";

const common = {
  allowOverlay: true,
  readonly: false,
};

export function textCell(value: string): GridCell {
  return {
    ...common,
    data: value,
    displayData: value,
    kind: GridCellKind.Text,
  };
}

export function readonlyTextCell(
  value: string,
  hasCursorPointer: boolean = true,
): GridCell {
  return {
    cursor: hasCursorPointer ? "pointer" : "default",
    allowOverlay: false,
    readonly: true,
    data: value,
    displayData: value,
    kind: GridCellKind.Text,
  };
}

export function tagsCell(
  tags: Array<{ tag: string; color: string }>,
  selectedTags: string[],
  opts?: Partial<GridCell>,
): GridCell {
  return {
    ...opts,
    kind: GridCellKind.Custom,
    allowOverlay: true,
    copyData: selectedTags.join(", "),
    data: {
      kind: "tags-cell",
      possibleTags: tags,
      tags: selectedTags,
    },
  };
}

export function booleanCell(value: boolean): GridCell {
  return {
    ...common,
    allowOverlay: false,
    kind: GridCellKind.Boolean,
    data: value,
  };
}

export function loadingCell(): GridCell {
  return {
    kind: GridCellKind.Custom,
    allowOverlay: true,
    copyData: "",
    data: {
      kind: "spinner-cell",
    },
  };
}

export function numberCell(
  value: number | typeof numberCellEmptyValue,
): NumberCell {
  return {
    ...common,
    data: {
      kind: "number-cell",
      value,
    },
    kind: GridCellKind.Custom,
    copyData: value !== numberCellEmptyValue ? value.toString() : "",
  };
}

interface MoneyCellData {
  value: number | string | null;
  discount?: string | number;
  readonly undiscounted?: string | number;
  currency: string;
  locale: Locale;
}

export function moneyCell(
  { value, undiscounted, currency, locale }: MoneyCellData,
  opts?: Partial<GridCell>,
): MoneyCell {
  return {
    ...common,
    ...opts,
    kind: GridCellKind.Custom,
    data: {
      kind: "money-cell",
      value,
      currency,
      undiscounted,
      locale,
    },
    copyData: value?.toString() ?? "",
  };
}

export function dropdownCell(
  value: DropdownChoice,
  dataOpts: DropdownCellContentProps &
    (
      | { choices: DropdownChoice[] }
      | { update: (text: string) => Promise<DropdownChoice[]> }
    ),
  opts?: Partial<GridCell>,
): DropdownCell {
  return {
    ...common,
    ...opts,
    data: {
      ...dataOpts,
      kind: "dropdown-cell",
      value,
    },
    kind: GridCellKind.Custom,
    copyData: value.label,
  };
}

export function thumbnailCell(
  name: string,
  image: string,
  opts?: Partial<GridCell>,
): ThumbnailCell {
  return {
    ...common,
    ...opts,
    kind: GridCellKind.Custom,
    copyData: name ?? "",
    data: {
      kind: "thumbnail-cell",
      image,
      name,
    },
  };
}
