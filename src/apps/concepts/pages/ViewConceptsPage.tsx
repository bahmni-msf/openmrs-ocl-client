import React, { useEffect, useState } from "react";
import { createStyles, Grid, makeStyles, Theme } from "@material-ui/core";
import { ConceptsTable, AddConceptsIcon } from "../components";
import { connect } from "react-redux";
import {
  removeConceptsFromDictionaryLoadingSelector,
  retrieveConceptsAction,
  viewConceptsLoadingSelector,
  viewConceptsErrorsSelector,
} from "../redux";
import { AppState } from "../../../redux";
import { APIConcept, OptionalQueryParams as QueryParams } from "../types";
import { useHistory, useLocation, useParams } from "react-router";
import { useQueryParams } from "../../../utils";
import qs from "qs";
import { ProgressOverlay } from "../../../utils/components";
import FilterOptions from "../components/FilterOptions";
import {
  APIOrg,
  APIProfile,
  canModifyContainer,
  profileSelector,
} from "../../authentication";
import { orgsSelector } from "../../authentication/redux/reducer";
import {
  DICTIONARY_CONTAINER,
  FILTER_SOURCE_IDS,
  SOURCE_CONTAINER,
  SOURCE_VERSION_CONTAINER,
} from "../constants";
import {
  dictionarySelector,
  recursivelyAddConceptsToDictionaryAction,
  removeReferencesFromDictionaryAction,
  makeRetrieveDictionaryAction,
  retrieveDictionaryLoadingSelector,
} from "../../dictionaries/redux";
import { canModifyConcept, getContainerIdFromUrl } from "../utils";
import { APIDictionary } from "../../dictionaries";
import {
  sourceSelector,
  retrieveSourceLoadingSelector,
  retrieveSourceAndDetailsAction,
  makeRetrieveSourceAction,
} from "../../sources/redux";
import { APISource } from "../../sources";
import ViewConceptsHeader from "../components/ViewConceptsHeader";

export interface StateProps {
  concepts?: APIConcept[];
  dictionary?: APIDictionary;
  source?: APISource;
  loading: boolean;
  errors?: {};
  meta?: { num_found?: number };
  profile?: APIProfile;
  usersOrgs?: APIOrg[];
}

export type ActionProps = {
  retrieveConcepts: (
    ...args: Parameters<typeof retrieveConceptsAction>
  ) => void;
  retrieveDictionary: (
    ...args: Parameters<ReturnType<typeof makeRetrieveDictionaryAction>>
  ) => void;
  addConceptsToDictionary: (
    ...args: Parameters<typeof recursivelyAddConceptsToDictionaryAction>
  ) => void;
  removeConceptsFromDictionary: (
    ...args: Parameters<typeof removeReferencesFromDictionaryAction>
  ) => void;
  retrieveSource: (
    ...args: Parameters<ReturnType<typeof makeRetrieveSourceAction>>
  ) => void;
};

export interface OwnProps {
  containerType: string;
}

type Props = StateProps & ActionProps & OwnProps;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    link: {
      textDecoration: "none",
      color: "inherit",
      width: "100%",
    },
    largerTooltip: {
      fontSize: "larger",
    },
    content: {
      height: "100%",
    },
  })
);

const INITIAL_LIMIT = 10; // todo get limit from settings

const ViewConceptsPage: React.FC<Props> = ({
  concepts,
  dictionary,
  source,
  loading,
  errors,
  retrieveConcepts,
  retrieveDictionary,
  retrieveSource,
  meta = {},
  profile,
  usersOrgs,
  containerType,
  addConceptsToDictionary,
  removeConceptsFromDictionary,
}) => {
  const classes = useStyles();

  const { replace: goTo } = useHistory(); // replace because we want to keep the back button useful
  const { pathname: url } = useLocation();
  const containerUrl = url.replace("/concepts", "");
  const { ownerType, owner } = useParams<{
    ownerType: string;
    owner: string;
  }>();

  // only relevant with the collection container
  const preferredSource = dictionary?.preferred_source || "Public Sources";
  const linkedSource =
    containerType === SOURCE_CONTAINER ||
    containerType === SOURCE_VERSION_CONTAINER
      ? source?.url
      : dictionary?.extras?.source;
  // end only relevant with the collection container

  const queryParams: QueryParams = useQueryParams();
  const {
    page = 1,
    sortDirection = "sortAsc",
    sortBy = "id",
    limit = INITIAL_LIMIT,
    q: initialQ = "",
    classFilters: initialClassFilters = [],
    dataTypeFilters: initialDataTypeFilters = [],
    sourceFilters: initialSourceFilters = [],
    addToDictionary: dictionaryToAddTo,
  } = queryParams;

  const [showOptions, setShowOptions] = useState(true);
  // why did he put the filtered state here and not inside the component, you ask?
  // consistency my friend, consistency. The key thing here is one can trigger a requery by changing
  // the page count/ number and if the state is not up here then, we query with stale options
  const [classFilters, setClassFilters] = useState<string[]>(
    initialClassFilters
  );
  const [dataTypeFilters, setInitialDataTypeFilters] = useState<string[]>(
    initialDataTypeFilters
  );
  const [sourceFilters, setSourceFilters] = useState<string[]>(
    initialSourceFilters
  );
  const [q, setQ] = useState(initialQ);

  const gimmeAUrl = (params: QueryParams = {}, conceptsUrl: string = url) => {
    const newParams: QueryParams = {
      ...queryParams,
      ...{
        classFilters: classFilters,
        dataTypeFilters: dataTypeFilters,
        sourceFilters: sourceFilters,
        page: 1,
        q,
      },
      ...params,
    };
    return `${conceptsUrl}?${qs.stringify(newParams)}`;
  };

  useEffect(() => {
    // we don't make this reactive(only depend on the initial values), because the requirement
    // was only trigger queries on user search(enter or apply filters, or change page)
    containerType === SOURCE_CONTAINER
      ? retrieveSource(containerUrl)
      : retrieveDictionary(containerUrl);

    retrieveConcepts({
      conceptsUrl: url,
      page: page,
      limit: limit,
      q: initialQ,
      sortDirection: sortDirection,
      sortBy: sortBy,
      dataTypeFilters: initialDataTypeFilters,
      classFilters: initialClassFilters,
      sourceFilters: initialSourceFilters,
      includeRetired: true,
    });
    // i don't know how the comparison algorithm works, but for these arrays, it fails.
    // stringify the arrays to work around that
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    retrieveConcepts,
    url,
    page,
    limit,
    initialQ,
    sortDirection,
    sortBy,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    initialDataTypeFilters.toString(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    initialClassFilters.toString(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    initialSourceFilters.toString(),
  ]);

  const canModifyDictionary =
    containerType === DICTIONARY_CONTAINER &&
    canModifyContainer(ownerType, owner, profile, usersOrgs);

  const canModifySource =
    containerType === SOURCE_CONTAINER &&
    canModifyContainer(ownerType, owner, profile, usersOrgs) &&
    !dictionaryToAddTo;

  return (
    <>
      <ViewConceptsHeader
        containerType={containerType}
        containerUrl={containerUrl}
        gimmeAUrl={gimmeAUrl}
        addConceptToDictionary={dictionaryToAddTo}
      />
      <Grid
        container
        className={classes.content}
        component='div'
        // @ts-ignore
        justify='space-around'
        alignItems='flex-start'
      >
        <ProgressOverlay
          loading={loading}
          error={
            errors
              ? "Could not fetch concepts. Refresh this page to retry"
              : undefined
          }
        >
          <Grid
            id='viewConceptsPage'
            item
            xs={showOptions ? 9 : 12}
            component='div'
          >
            <ConceptsTable
              concepts={concepts || []}
              buttons={{
                edit: canModifyDictionary || canModifySource, // relevant for DICTIONARY_CONTAINER, condition already includes isDictionary condition
                addToDictionary:
                  containerType === SOURCE_CONTAINER && !!dictionaryToAddTo, // relevant for SOURCE_CONTAINER
              }}
              q={q}
              setQ={setQ}
              page={page}
              sortDirection={sortDirection}
              sortBy={sortBy}
              limit={Number(limit)}
              buildUrl={gimmeAUrl}
              goTo={goTo}
              count={meta.num_found || concepts?.length || 0}
              toggleShowOptions={() => setShowOptions(!showOptions)}
              addConceptsToDictionary={(concepts: APIConcept[]) =>
                dictionaryToAddTo &&
                addConceptsToDictionary(
                  containerUrl,
                  dictionaryToAddTo,
                  concepts
                )
              }
              linkedDictionary={containerUrl}
              linkedSource={linkedSource}
              canModifyConcept={(concept: APIConcept) =>
                canModifyConcept(concept.url, profile, usersOrgs)
              }
              removeConceptsFromDictionary={(conceptVersionUrls: string[]) =>
                removeConceptsFromDictionary(containerUrl, conceptVersionUrls)
              }
            />
          </Grid>
          {!showOptions ? (
            ""
          ) : (
            <Grid item xs={2} component='div'>
              <FilterOptions
                checkedClasses={classFilters}
                setCheckedClasses={setClassFilters}
                checkedDataTypes={dataTypeFilters}
                setCheckedDataTypes={setInitialDataTypeFilters}
                checkedSources={sourceFilters}
                setCheckedSources={setSourceFilters}
                showSources={containerType !== SOURCE_CONTAINER}
                // interesting how we generate these, isn't it? yeah well, this is an important feature, so there :)
                sourceOptions={
                  [
                    getContainerIdFromUrl(linkedSource),
                    ...FILTER_SOURCE_IDS,
                  ].filter((source) => source !== undefined) as string[]
                }
                url={gimmeAUrl()}
              />
            </Grid>
          )}
        </ProgressOverlay>
      </Grid>

      <AddConceptsIcon
        canModifyDictionary={canModifyDictionary}
        canModifySource={canModifySource}
        containerUrl={containerUrl}
        gimmeAUrl={gimmeAUrl}
        linkedSource={linkedSource}
        preferredSource={preferredSource}
      />
    </>
  );
};

const mapStateToProps = (state: AppState) => ({
  profile: profileSelector(state),
  usersOrgs: orgsSelector(state),
  concepts: state.concepts.concepts ? state.concepts.concepts.items : undefined,
  dictionary: dictionarySelector(state),
  source: sourceSelector(state),
  meta: state.concepts.concepts
    ? state.concepts.concepts.responseMeta
    : undefined,
  loading:
    viewConceptsLoadingSelector(state) ||
    retrieveDictionaryLoadingSelector(state) ||
    removeConceptsFromDictionaryLoadingSelector(state) ||
    retrieveSourceLoadingSelector(state),
  errors: viewConceptsErrorsSelector(state),
});

const mapActionsToProps = {
  retrieveConcepts: retrieveConceptsAction,
  retrieveDictionary: makeRetrieveDictionaryAction(true),
  retrieveSource: makeRetrieveSourceAction(true),
  addConceptsToDictionary: recursivelyAddConceptsToDictionaryAction,
  removeConceptsFromDictionary: removeReferencesFromDictionaryAction,
};

export default connect<StateProps, ActionProps, OwnProps, AppState>(
  mapStateToProps,
  mapActionsToProps
)(ViewConceptsPage);
