import { BaseConceptContainer } from "../../utils";

interface BaseSource extends BaseConceptContainer {
  extras?: { source?: string };
}

export interface Source extends BaseSource {
  supported_locales: string[];
  website: string;
  custom_validation_schema: string;
  source_type: string;
  external_id: string;
}
interface BaseAPISource extends BaseConceptContainer {
  external_id: string;
  id: string;
  full_name: string;
  website: string;
  custom_validation_schema: string;
}

export interface NewAPISource extends BaseAPISource {
  // api expects a comma separated string for this in create/ edit data
  supported_locales: string;
}

export interface APISource extends BaseAPISource {
  source_type: string;
  url: string;
  active_concepts: number;
  active_mappings: number;
  concepts_url: string;
  extras?: {};
  supported_locales: string[];
  owner: string;
  owner_type: string;
  owner_url: string;
}

export interface SourceState {
  sources: { items: APISource[]; responseMeta?: {} }[];
  source?: APISource;
}

const apiSourceToSource = (apiSource?: APISource): Source | undefined => {
  if (!apiSource) return apiSource;

  const { url, supported_locales, ...theRest } = apiSource;

  return {
    supported_locales: supported_locales || [],
    ...theRest,
  };
};

export { apiSourceToSource };
