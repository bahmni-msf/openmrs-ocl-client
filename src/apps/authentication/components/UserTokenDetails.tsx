import React from "react";
import {
    Button,
    Paper,
    Tooltip,
    Typography
} from "@material-ui/core";
import CopyToClipboard from "react-copy-to-clipboard";

interface Props {
    token?: string;
}

const UserTokenDetails: React.FC<Props> = ({
                                                    token
                                                }) => {

    return (
        <Paper className='fieldsetParent'>
            <fieldset>
                <Typography component='legend' variant='h5' gutterBottom>
                    API Token Details
                </Typography>
                <Typography variant='h6' data-testid='concepts-summary' gutterBottom>
                    <b>API Token: </b> {token}
                </Typography>
                <CopyToClipboard
                    text={token ? token : ""}
                >
                    <Tooltip title="Copy API Token">
                        <Button size="small" variant="text" color="primary" fullWidth>
                            Copy API Token
                        </Button>
                    </Tooltip>
                </CopyToClipboard>
            </fieldset>
        </Paper>
    );
};

export default UserTokenDetails;
