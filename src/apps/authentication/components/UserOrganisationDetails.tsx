import React from "react";
import {Paper, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {APIOrg} from "../types";

interface Props {
    orgs?: APIOrg[];
}

const useStyles = makeStyles({
    token: {
        wordBreak: "break-all",
        color: "black"
    },
    container: {
        minWidth: "0"
    }
});

const UserOrganisationDetails: React.FC<Props> = ({
                                                      orgs
                                                  }) => {
    const classes = useStyles();

    const getUserOrganisationsList = () => {
        const OrganisationsList: Array<JSX.Element> = [];
        if (orgs) {
            orgs.map(org => (
                OrganisationsList.push(
                    <li key={org.id}>
                        {org.name}
                    </li>
                )
            ));
        }
        return OrganisationsList;
    };

    return (
        <Paper className='fieldsetParent'>
            <fieldset className={classes.container}>
                <Typography component='legend' variant='h5' gutterBottom>
                    User Organisations
                </Typography>
                {getUserOrganisationsList()}
            </fieldset>
        </Paper>
    );
};


export default UserOrganisationDetails;
