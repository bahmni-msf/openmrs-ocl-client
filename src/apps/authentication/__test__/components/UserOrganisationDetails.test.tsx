import React from "react";
import {render} from "../../../../test-utils";
import {UserOrganisationDetails} from "../../components";
import {testAPIOrgList} from "../test_data";

type userOrganisationDetailsProps = React.ComponentProps<typeof UserOrganisationDetails>;

const baseProps: userOrganisationDetailsProps = {
    orgs: testAPIOrgList
};

function renderUI(props: Partial<userOrganisationDetailsProps> = {}) {
    return render(<UserOrganisationDetails {...baseProps} {...props} />);
}

describe("UserOrganisationDetails", () => {
    it("should match snapshot", () => {
        const {container} = renderUI(baseProps);

        expect(container).toMatchSnapshot();
    });
});