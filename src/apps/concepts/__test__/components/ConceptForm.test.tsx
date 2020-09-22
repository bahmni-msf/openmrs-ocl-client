// import { render } from '@testing-library/react';
import React from 'react';
import { render } from '../../../../test-utils';
import { ConceptForm } from '../../components';
// import {BrowserRouter as Router} from "react-router-dom";

type sourcesFormProps = React.ComponentProps<typeof ConceptForm>;
let savedValues: any;
const baseProps: sourcesFormProps = {
    onSubmit: () => {},
    loading: true,
    status: "",
    errors: {},
    savedValues: savedValues,
    context: "view",
    allMappingErrors: [],
    conceptClass: "Diagnosis",
    supportLegacyMappings: true,
    defaultLocale: "",
    supportedLocales:[]
};

function renderUI(props: Partial<sourcesFormProps> = {}) {
    return render(
        <ConceptForm {...baseProps} {...props} />
    );
};

describe('ConceptForm ', () => {
   it('snapshot test', () => {
       const {container} = renderUI();
       expect(container).toMatchSnapshot();
   });
});
