import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import NotificationDetails from "../components/NotificationDetails";
import {
  NotificationItem,
  NotificationItemRow
} from "../types";

type notificationDetailsProps = React.ComponentProps<typeof NotificationDetails>;

const notificationItemRow: NotificationItemRow ={
  expression: "/orgs/testOrg/sources/testSource/concepts/testConceptID/",
  added: true,
  message: "concept imported successfully"
};
const notificationItem: NotificationItem = {
  result: [notificationItemRow],
  progress: "",
  meta: ["/users/testUser/collections/testDictionary/"]
};

const handleClose = jest.fn();
const baseProps: notificationDetailsProps = {
  open: true,
  handleClose: handleClose,
  notification: notificationItem
};

function renderUI(props: Partial<notificationDetailsProps> = {}) {
  return render(
    <NotificationDetails {...baseProps} {...props} />
  );
}

describe("NotificationDetails", () => {
  it("should show the correct title", () => {
    const { queryByTestId } = renderUI();
    const title = queryByTestId('title') || {textContent:null};

    expect(title.textContent).toBe("testDictionary - Adding concepts from testSource");
  });

  it("should hide dialog on click of close button", () => {
    const { getByText } = renderUI();
    const closeButton = getByText('Close');
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

describe("Notification Summary Table", () => {

  const notificationItemRow1: NotificationItemRow ={
    expression: "/orgs/testOrg/sources/testSource/concepts/testConceptID1/",
    added: true,
    message: "concept imported successfully"
  };
  const notificationItemRow2: NotificationItemRow ={
    expression: "/orgs/testOrg/sources/testSource/concepts/testConceptID2/",
    added: false,
    message: "concept import failed due to conflicts"
  };
  const notificationItemRow3: NotificationItemRow ={
    expression: "/orgs/testOrg/sources/testSource/concepts/testDependentConceptID1/",
    added: true,
    message: "concept imported successfully"
  };
  const notificationItemRow4: NotificationItemRow ={
    expression: "/orgs/testOrg/sources/testSource/concepts/testDependentConceptID2/",
    added: false,
    message: "concept import failed due to conflicts"
  };

  const notificationItem: NotificationItem = {
    result: [notificationItemRow1, notificationItemRow2, notificationItemRow3, notificationItemRow4],
    progress: "",
    meta: ["/users/testUser/collections/testDictionary/", [{id: "testConceptID1"}, {id: "testConceptID2"}]]
  };

  let queryByTestId: Function;
  beforeEach(() => {
    const queries = renderUI({
      notification: notificationItem
    });
    queryByTestId = queries.queryByTestId;
  });

  it("should have the correct table headers", () => {
    const enhancedTableHead = queryByTestId('enhancedTableHead');
    const enhancedTableHeadData = enhancedTableHead ? enhancedTableHead.querySelectorAll("th"): [];

    expect(enhancedTableHeadData.length).toEqual(4);
    expect(enhancedTableHeadData[0].textContent).toBe("Concept ID");
    expect(enhancedTableHeadData[1].textContent).toBe("Concept Type");
    expect(enhancedTableHeadData[2].textContent).toBe("Statussorted descending");
    expect(enhancedTableHeadData[3].textContent).toBe("Reasons");
  });

  it("should have the correct table data in appropriate columns - Parent Concept Imported", () => {
    const tableRow = queryByTestId('testConceptID1');
    const tableRowData = tableRow ? tableRow.querySelectorAll("td"): [];

    expect(tableRowData.length).toEqual(4);
    expect(tableRowData[0].textContent).toBe("testConceptID1");
    expect(tableRowData[1].textContent).toBe("Parent");
    expect(tableRowData[2].textContent).toBe("Imported");
    expect(tableRowData[3].textContent).toBe("concept imported successfully");
  });

  it("should have the correct table data in appropriate columns - Parent Concept Failed", () => {
    const tableRow = queryByTestId('testConceptID2');
    const tableRowData = tableRow ? tableRow.querySelectorAll("td"): [];

    expect(tableRowData.length).toEqual(4);
    expect(tableRowData[0].textContent).toBe("testConceptID2");
    expect(tableRowData[1].textContent).toBe("Parent");
    expect(tableRowData[2].textContent).toBe("Skipped");
    expect(tableRowData[3].textContent).toBe("concept import failed due to conflicts");
  });

  it("should have the correct table data in appropriate columns - Dependent Concept Imported", () => {
    const tableRow = queryByTestId('testDependentConceptID1');
    const tableRowData = tableRow ? tableRow.querySelectorAll("td"): [];

    expect(tableRowData.length).toEqual(4);
    expect(tableRowData[0].textContent).toBe("testDependentConceptID1");
    expect(tableRowData[1].textContent).toBe("Dependent");
    expect(tableRowData[2].textContent).toBe("Imported");
    expect(tableRowData[3].textContent).toBe("concept imported successfully");
  });

  it("should have the correct table data in appropriate columns - Dependent Concept Failed", () => {
    const tableRow = queryByTestId('testDependentConceptID2');
    const tableRowData = tableRow ? tableRow.querySelectorAll("td"): [];

    expect(tableRowData.length).toEqual(4);
    expect(tableRowData[0].textContent).toBe("testDependentConceptID2");
    expect(tableRowData[1].textContent).toBe("Dependent");
    expect(tableRowData[2].textContent).toBe("Skipped");
    expect(tableRowData[3].textContent).toBe("concept import failed due to conflicts");
  });
});
