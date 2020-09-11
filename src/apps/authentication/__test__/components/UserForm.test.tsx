import React from "react";
import UserForm from "../../components/UserForm";
import {render} from "../../../../test-utils";
import {BrowserRouter as Router} from "react-router-dom";
import {testProfile} from "../test_data";

type userFormProps = React.ComponentProps<typeof UserForm>;

const baseProps: userFormProps = {
    loading: true,
    savedValues: testProfile
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