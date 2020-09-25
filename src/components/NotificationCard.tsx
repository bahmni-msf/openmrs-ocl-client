import React from "react";
import {Card, CardActions, CardContent, Chip, ListItem, makeStyles, Tooltip, Typography} from "@material-ui/core";
import {getLocalStorageObject} from "../redux/localStorageUtils";
import moment from "moment";
import {ImportMetaData} from "../apps/dictionaries";

interface Props {
    headerMessage: string,
    subHeaderMessage: string,
    index: number
}

const useStyles = makeStyles({
    card: {
        width: "100%"
    },
    chip: {
        maxWidth: 200,
    },
    cardFooter: {
        paddingLeft: 8,
    },
    cardContent: {
        paddingBottom: 2
    }
});

const NotificationCard: React.FC<Props> = ({
                                               headerMessage,
                                               subHeaderMessage,
                                               index
                                           }) => {
    const classes = useStyles();

    const importMetaDataItemsList: ImportMetaData[] = []

    const importMetaDataItems = getLocalStorageObject({
        name: "notification",
        key: "importMetaDataList",
        value: importMetaDataItemsList,
    }).reverse() as ImportMetaData[];

    const showImportDateTime = (index: number) => {
        return (
            <Typography variant='subtitle2' color='textSecondary' className={classes.cardFooter}>
                <Tooltip title={moment(importMetaDataItems[index].dateTime).format("DD MMM YYYY HH:mm")} enterDelay={700}>
                    <span>{moment(importMetaDataItems[index].dateTime).fromNow()}</span>
                </Tooltip>
            </Typography>
        );
    };

    const dictionaryNameFromUrl = (url: string): string => {
        let words = url.split("/");
        console.log(words);
        return words[words.length - 2];
    };

    const showDictionaryName = (index: number) => {
        return (
            <Tooltip title={"Redirect to Dictionary"}>
            <Chip
                color='primary'
                size='small'
                className={classes.chip}
                label={dictionaryNameFromUrl(importMetaDataItems[index].dictionary)}
                component='a'
                href={importMetaDataItems[index].dictionary}
                clickable
            />
            </Tooltip>
        );
    };

    return (
        <ListItem key={index}>
            <Card className={classes.card}>
                <CardContent className={classes.cardContent}>
                    {showDictionaryName(index)}
                    <Typography
                        noWrap
                        variant="subtitle1"
                    >
                        {headerMessage}
                    </Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                        {subHeaderMessage}
                    </Typography>
                </CardContent>
                <CardActions>{showImportDateTime(index)}</CardActions>
            </Card>
        </ListItem>
    )
}

export default NotificationCard;

