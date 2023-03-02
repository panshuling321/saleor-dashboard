import {
  loadingCell,
  readonlyTextCell,
  textCell,
} from "@dashboard/components/Datagrid/cells";
import { GetCellContentOpts } from "@dashboard/components/Datagrid/Datagrid";
import { AvailableColumn } from "@dashboard/components/Datagrid/types";
import { Locale } from "@dashboard/components/Locale";
import { getMoney } from "@dashboard/components/Money/utils";
import { OrderListQuery } from "@dashboard/graphql";
import { transformOrderStatus, transformPaymentStatus } from "@dashboard/misc";
import { RelayToFlat } from "@dashboard/types";
import { GridCell, Item } from "@glideapps/glide-data-grid";
import moment from "moment-timezone";
import { IntlShape } from "react-intl";

import { columnsMessages } from "./messages";

export const getColumns = (intl: IntlShape): AvailableColumn[] => [
  {
    id: "empty",
    title: "",
    width: 20,
  },
  {
    id: "number",
    title: intl.formatMessage(columnsMessages.number),
    width: 100,
  },
  {
    id: "date",
    title: intl.formatMessage(columnsMessages.date),
    width: 200,
  },
  {
    id: "customer",
    title: intl.formatMessage(columnsMessages.customer),
    width: 200,
  },
  {
    id: "payment",
    title: intl.formatMessage(columnsMessages.payment),
    width: 200,
  },
  {
    id: "status",
    title: intl.formatMessage(columnsMessages.status),
    width: 200,
  },
  {
    id: "total",
    title: intl.formatMessage(columnsMessages.total),
    width: 150,
  },
];

interface GetCellContentProps {
  columns: AvailableColumn[];
  orders: RelayToFlat<OrderListQuery["orders"]>;
  loading: boolean;
  locale: Locale;
  intl: IntlShape;
}

export function createGetCellContent({
  columns,
  orders,
  loading,
  locale,
  intl,
}: GetCellContentProps) {
  return (
    [column, row]: Item,
    { added, removed }: GetCellContentOpts,
  ): GridCell => {
    if (column === -1) {
      return textCell("");
    }

    if (loading) {
      return loadingCell();
    }

    const columnId = columns[column].id;
    const rowData = added.includes(row)
      ? undefined
      : orders[row + removed.filter(r => r <= row).length];

    switch (columnId) {
      case "number":
        return readonlyTextCell(rowData.number, {
          cursor: "pointer",
        });
      case "date":
        return getDateCellContent(locale, rowData);
      case "customer":
        return getCustomerCellContent(rowData);
      case "payment":
        return getPaymentCellContent(intl, rowData);
      case "status":
        return getStatusCellContent(intl, rowData);
      case "total":
        return getTotalCellContent(locale, rowData);
      default:
        return textCell("");
    }
  };
}

function getDateCellContent(
  locale: Locale,
  rowData: RelayToFlat<OrderListQuery["orders"]>[number],
) {
  return readonlyTextCell(
    moment(rowData.created).locale(locale).format("lll"),
    {
      cursor: "pointer",
    },
  );
}

function getCustomerCellContent(
  rowData: RelayToFlat<OrderListQuery["orders"]>[number],
) {
  if (rowData.billingAddress) {
    return readonlyTextCell(
      `${rowData.billingAddress.firstName} ${rowData.billingAddress.lastName}`,
      { cursor: "pointer" },
    );
  }

  if (rowData.userEmail) {
    return readonlyTextCell(rowData.userEmail, { cursor: "pointer" });
  }

  return readonlyTextCell("-", {
    cursor: "pointer",
  });
}

function getPaymentCellContent(
  intl: IntlShape,
  rowData: RelayToFlat<OrderListQuery["orders"]>[number],
) {
  const paymentStatus = transformPaymentStatus(rowData.paymentStatus, intl);
  if (paymentStatus?.status) {
    return readonlyTextCell(paymentStatus.localized, {
      cursor: "pointer",
    });
  }

  return readonlyTextCell("-", {
    cursor: "pointer",
  });
}

function getStatusCellContent(
  intl: IntlShape,
  rowData: RelayToFlat<OrderListQuery["orders"]>[number],
) {
  const status = transformOrderStatus(rowData.status, intl);

  if (status) {
    return readonlyTextCell(status.localized, {
      cursor: "pointer",
    });
  }

  return readonlyTextCell("-", {
    cursor: "pointer",
  });
}

function getTotalCellContent(
  locale: Locale,
  rowData: RelayToFlat<OrderListQuery["orders"]>[number],
) {
  if (rowData?.total?.gross) {
    return readonlyTextCell(getMoney(rowData.total.gross, locale), {
      cursor: "pointer",
    });
  }

  return readonlyTextCell("-", {
    cursor: "pointer",
  });
}
