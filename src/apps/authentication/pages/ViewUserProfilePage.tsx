import React from "react";
import UserForm from "../components/UserForm";
import UserTokenDetails from "../components/UserTokenDetails";
import { Grid, Paper, Typography } from "@material-ui/core";
import { connect } from "react-redux";
import {APIProfile, getUserDetailsAction, profileSelector} from "../../authentication";
import { AppState } from "../../../redux";
import { ProgressOverlay } from "../../../utils/components";
import Header from "../../../components/Header";


interface Props {
    loading: boolean;
    errors?: any;
    APIProfile?: APIProfile;
    userToken?: string;
}

export const ViewUserProfilePage: React.FC<Props> = ({
                                                         loading,
                                                         errors,
                                                         APIProfile,
                                                         userToken
                                                }: Props) => {

    return (
        <Header
            title="Your Profile"
            justifyChildren='space-around'
        >
            <ProgressOverlay
                delayRender
                loading={loading}
                error={
                    errors
                        ? "Could not load user details. Refresh the page to retry"
                        : undefined
                }
            >
                <Grid id='viewUserProfilePage' item xs={5} component='div'>
                    <Paper className='fieldsetParent'>
                        <fieldset>
                            <Typography component='legend' variant='h5' gutterBottom>
                                Details
                            </Typography>
                            <UserForm
                                savedValues={APIProfile}
                                loading={true}
                            />
                        </fieldset>
                    </Paper>
                </Grid>
                <Grid item xs={5} container spacing={2}>
                    <Grid item xs={12} component="div">
                        <Grid item xs={12} component='div'>
                            <UserTokenDetails
                                token={userToken}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </ProgressOverlay>
        </Header>
    );
};

const mapStateToProps = (state: AppState) => ({
    loading: false,
    errors: undefined,
    APIProfile: profileSelector(state),
    userToken: state.auth.token
});
const mapDispatchToProps = {
    retrieveUserDetails: getUserDetailsAction
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewUserProfilePage);
