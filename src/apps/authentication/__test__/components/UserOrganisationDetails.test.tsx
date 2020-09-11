import React from "react";
import {render} from "../../../../test-utils";
import {UserOrganisationDetails} from "../../components";
import {APIOrg} from "../../types";

const apiOrg: APIOrg[] = [
    {
        id: "test1", name: "Test Organisation", url: ""
    },
    {
        id: "test2", name: "Another Organisation", url: ""
    }
];

type userOrganisationDetailsProps = React.ComponentProps<typeof UserOrganisationDetails>;

const baseProps: userOrganisationDetailsProps = {
    orgs: apiOrg
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