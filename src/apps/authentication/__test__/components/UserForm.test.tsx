import React from "react";
import UserForm from "../../components/UserForm";
import {render} from "../../../../test-utils";
import {APIProfile} from "../../types";
import {BrowserRouter as Router} from "react-router-dom";

type userFormProps = React.ComponentProps<typeof UserForm>;

const profile: APIProfile = {
    username: "TestUser",
    name: "TestUser",
    email: "TestUser@test.com",
    company: "Test Company",
    location: "Test Location",
    created_on: "1900-01-01T00:00:00.000"
};

const baseProps: userFormProps = {
    loading: true,
    savedValues: profile
};

function renderUI(props: Partial<userFormProps> = {}) {
    return render(
        <Router>
            <UserForm {...baseProps} {...props} />
        </Router>
    );
}

describe("UserForm", () => {
    it("should match snapshot", () => {
        const {container} = renderUI(baseProps);

        expect(container).toMatchSnapshot();
    });
});