import React from "react";
import {Card, CardContent, ListItem, makeStyles, Tooltip, Typography} from "@material-ui/core";
import {getLocalStorageObject} from "../redux/localStorageUtils";
import moment from "moment";

interface Props {
    headerMessage: string,
    subHeaderMessage: string,
    index: number
}

const useStyles = makeStyles({
    card: {
        width: "100%"
    },
    scrollLongText: {
        overflowX: "scroll"
    }
});

const NotificationCard: React.FC<Props> = ({
                                               headerMessage,
                                               subHeaderMessage,
                                               index
                                           }) => {
    const classes = useStyles();

    const importDateTimeList: string[] = []

    const importDateTimeItems = getLocalStorageObject({
        name: "notification",
        key: "importDateTimeList",
        value: importDateTimeList,
    }).reverse() as string[];

    const showImportDateTime = (index: number) => {
        return (
            <Typography variant='subtitle2' color='textSecondary'>
                <Tooltip title={moment(importDateTimeItems[index]).format("DD MMM YYYY HH:mm")} enterDelay={700}>
                    <span>{moment(importDateTimeItems[index]).fromNow()}</span>
                </Tooltip>
            </Typography>
        );
    };

    return (
        <ListItem key={index}>
            <Card className={classes.card}>
                <CardContent>
                    <Typography
                        noWrap
                        variant="subtitle1"
                        className={classes.scrollLongText}
                    >
                        {headerMessage}
                    </Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                        {subHeaderMessage}
                    </Typography>
                    {showImportDateTime(index)}
                </CardContent>
            </Card>
        </ListItem>
    )
}

export default NotificationCard;

