import React, { useEffect } from "react";
import {
  createStyles,
  lighten,
  makeStyles,
  Theme,
} from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import { APIConcept, QueryParams, SortableField } from "../types";
import { Link } from "react-router-dom";
import {
  Add as AddIcon,
  DeleteSweepOutlined as DeleteIcon,
  EditOutlined as EditIcon,
  MoreVert as MoreVertIcon,
} from "@material-ui/icons";
import { Menu, MenuItem } from "@material-ui/core";
import { EnhancedTableHead } from "./EnhancedTableHead";
import { EnhancedTableToolbar } from "./EnhancedTableToolbar";

interface Props extends QueryParams {
  concepts: APIConcept[];
  buildUrl: Function;
  goTo: Function;
  count: number;
  toggleShowOptions: Function;
  q: string;
  setQ: Function;
  buttons?: { [key: string]: boolean };
  addConceptsToDictionary: Function;
  removeConceptsFromDictionary: (conceptVersionUrls: string[]) => void;
  linkedDictionary?: string;
  linkedSource?: string;
  canModifyConcept: (concept: APIConcept) => boolean;
}

interface HeadCell {
  disablePadding: boolean;
  id: SortableField;
  label: string;
}

export const headCells: HeadCell[] = [
  { id: "name", disablePadding: false, label: "Name" },
  { id: "conceptClass", disablePadding: false, label: "Class" },
  { id: "datatype", disablePadding: false, label: "Datatype" },
  { id: "id", disablePadding: false, label: "ID" },
];

export const useToolbarStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1),
    },
    highlight:
      theme.palette.type === "light"
        ? {
            color: theme.palette.secondary.main,
            backgroundColor: lighten(theme.palette.secondary.light, 0.85),
          }
        : {
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.secondary.dark,
          },
    title: {
      flex: "1 1 100%",
    },
  })
);

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      marginTop: theme.spacing(3),
    },
    paper: {
      width: "100%",
      marginBottom: theme.spacing(2),
    },
    table: {
      minWidth: 750,
    },
    tableWrapper: {
      overflowX: "auto",
      height: "72vh",
    },
    visuallyHidden: {
      border: 0,
      clip: "rect(0 0 0 0)",
      height: 1,
      margin: -1,
      overflow: "hidden",
      padding: 0,
      position: "absolute",
      top: 20,
      width: 1,
    },
    buttonLink: {
      textDecoration: "none",
      color: "inherit",
    },
    retired: {
      textDecoration: "line-through",
    },
  })
);

function showEditMenuItem(
  concept: APIConcept,
  showingEditButtons: boolean,
  linkedSource: string | undefined,
  canModifyConcept: (concept: APIConcept) => boolean
) {
  // only allow edit of a concept we can modify and belongs to our linked source
  // the second condition prevents us editing non custom concepts in a collection
  return (
    showingEditButtons &&
    canModifyConcept(concept) &&
    linkedSource &&
    concept.url.includes(linkedSource)
  );
}

function showRemoveFromDictionaryMenuItem(
  concept: APIConcept,
  showingEditButtons: boolean,
  linkedSource: string | undefined
) {
  // only allow manual removal of imported/ non custom concepts
  return (
    showingEditButtons && linkedSource && !concept.url.includes(linkedSource)
  );
}

const ConceptsTable: React.FC<Props> = ({
  concepts,
  buildUrl,
  goTo,
  count,
  q,
  setQ,
  page,
  limit,
  sortBy,
  sortDirection,
  toggleShowOptions,
  buttons = {},
  addConceptsToDictionary,
  removeConceptsFromDictionary,
  // current dictionary, for editing and creating concepts
  linkedDictionary,
  // source to store new concepts in and use as criteria for whether a user can edit a concept
  linkedSource,
  canModifyConcept,
}) => {
  const classes = useStyles();
  const [selected, setSelected] = React.useState<string[]>([]);
  const [menu, setMenu] = React.useState<{
    index: number;
    anchor: null | HTMLElement;
  }>({ index: -1, anchor: null });

  const resetSelected = () => setSelected([]);
  const isSelected = (id: string) => selected.includes(id);

  const toggleMenu = (
    index: number,
    event?: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (index === menu.index) setMenu({ index: -1, anchor: null });
    else if (event) setMenu({ index: index, anchor: event.currentTarget });
  };

  const setPage = (page: number) => goTo(buildUrl({ page: page + 1 }));
  const setOrder = (sortBy: string, sortDirection: string) =>
    goTo(buildUrl({ sortDirection, sortBy, page: 1 }));
  const setRowsPerPage = (limit: number) => goTo(buildUrl({ limit, page: 1 }));
  const search = (q: string) => goTo(buildUrl({ q, page: 1 }));

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: SortableField
  ) => {
    const isDesc = sortBy === property && sortDirection === "sortDesc";
    setOrder(property, isDesc ? "sortAsc" : "sortDesc");
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = concepts.map((concept) => concept.id);
      setSelected(newSelecteds);
      return;
    }
    resetSelected();
  };

  const toggleSelect = (event: React.MouseEvent<unknown>, id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  useEffect(() => {
    // reset selected concepts when new ones are fetched
    resetSelected();
    // usually doing the following is a mistake and will bite us later
    // we do it here because otherwise we'll have to enumerate all the possible things that could change
    // it really is saner to just condition it on the concept list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [concepts.toString()]);

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <EnhancedTableToolbar
          q={q}
          setQ={setQ}
          search={search}
          numSelected={selected.length}
          toggleShowOptions={toggleShowOptions}
          showAddConcepts={buttons.addToDictionary}
          addSelectedConcepts={() => {
            addConceptsToDictionary(
              concepts.filter((concept) => selected.includes(concept.id))
            );
            resetSelected();
          }}
        />
        <div className={classes.tableWrapper}>
          <Table
            stickyHeader
            className={classes.table}
            aria-labelledby='tableTitle'
            size='medium'
          >
            <EnhancedTableHead
              classes={classes}
              numSelected={selected.length}
              order={sortDirection}
              orderBy={sortBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={concepts.length}
            />
            <TableBody>
              {concepts.map((row, index) => {
                const isItemSelected = isSelected(row.id);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    data-testrowclass='conceptRow'
                    role='checkbox'
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={`${row.id}-${index}`}
                    selected={isItemSelected}
                  >
                    {selected.length <= 0 ? null : (
                      <TableCell padding='checkbox'>
                        <Checkbox
                          // ideally, we would have made this apply to the entire row, but there
                          // seems to be a problem with an implicit click when the row popup closes
                          onClick={(event) => toggleSelect(event, row.id)}
                          checked={isItemSelected}
                          inputProps={{ "aria-labelledby": labelId }}
                        />
                      </TableCell>
                    )}
                    <TableCell
                      onClick={(event) => toggleSelect(event, row.id)}
                      data-testclass='name'
                      className={row.retired ? classes.retired : ""}
                    >
                      <Link
                        onClick={(e) => e.stopPropagation()}
                        to={`${row.version_url}?linkedDictionary=${linkedDictionary}`}
                      >
                        {row.display_name}
                      </Link>
                    </TableCell>
                    <TableCell
                      onClick={(event) => toggleSelect(event, row.id)}
                      data-testclass='conceptClass'
                    >
                      {row.concept_class}
                    </TableCell>
                    <TableCell
                      onClick={(event) => toggleSelect(event, row.id)}
                      data-testclass='datatype'
                    >
                      {row.datatype}
                    </TableCell>
                    <TableCell onClick={(event) => toggleSelect(event, row.id)}>
                      {row.id}
                    </TableCell>
                    <TableCell padding='checkbox'>
                      <Tooltip title='More actions' enterDelay={700}>
                        <IconButton
                          id={`${index}.menu-icon`}
                          aria-controls={`${index}.menu`}
                          aria-haspopup='true'
                          onClick={(event) => toggleMenu(index, event)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                      <Menu
                        anchorEl={menu.anchor}
                        id={`${index}.menu`}
                        open={index === menu.index}
                        onClose={() => toggleMenu(index)}
                      >
                        {!showEditMenuItem(
                          row,
                          buttons.edit,
                          linkedSource,
                          canModifyConcept
                        ) ? null : (
                          <MenuItem onClick={() => toggleMenu(index)}>
                            <Link
                              className={classes.buttonLink}
                              to={`${row.version_url}edit/?linkedDictionary=${linkedDictionary}`}
                            >
                              <EditIcon /> Edit
                            </Link>
                          </MenuItem>
                        )}
                        {!showRemoveFromDictionaryMenuItem(
                          row,
                          buttons.edit,
                          linkedSource
                        ) ? null : (
                          <MenuItem
                            onClick={() => {
                              if (removeConceptsFromDictionary)
                                removeConceptsFromDictionary([row.version_url]);
                              toggleMenu(index);
                            }}
                          >
                            <DeleteIcon /> Remove
                          </MenuItem>
                        )}
                        {!buttons.addToDictionary ? null : (
                          <MenuItem
                            onClick={() => {
                              if (addConceptsToDictionary)
                                addConceptsToDictionary([row]);
                              toggleMenu(index);
                            }}
                          >
                            <AddIcon /> Add to dictionary
                          </MenuItem>
                        )}
                      </Menu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component='div'
          count={count}
          rowsPerPage={limit}
          page={page - 1}
          backIconButtonProps={{
            "aria-label": "previous page",
          }}
          nextIconButtonProps={{
            "aria-label": "next page",
          }}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
};

export default ConceptsTable;
