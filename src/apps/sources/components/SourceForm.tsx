import React, { useEffect, useRef } from "react";
import {
    Button,
    FormControl,
    InputLabel, ListSubheader,
    makeStyles,
    MenuItem,
    Typography
} from "@material-ui/core";
import {
    getPrettyError,
    LOCALES, PREFERRED_SOURCES,
} from "../../../utils";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { Select, TextField } from "formik-material-ui";
import { snakeCase } from "lodash";

import { Source } from "../types";
import { APIOrg, APIProfile } from "../../authentication";
import * as Yup from "yup";
import {Dictionary} from "../../dictionaries";

interface Props {
    onSubmit?: Function;
    loading: boolean;
    status?: string;
    profile?: APIProfile;
    usersOrgs: APIOrg[];
    errors?: {};
    savedValues?: Source;
    context?: string;
}

const initialValues: Source = {
    name: "",
    short_code: "",
    website: "",
    source_type: "",
    description: "",
    public_access: "",
    default_locale: "",
    supported_locales: [],
    custom_validation_schema: "",
    external_id: ""
};

const SourceSchema = Yup.object().shape<Source>({
    name: Yup.string().required("Source name is required"),
    short_code: Yup.string()
        .required("Short code is required")
        .matches(/^[a-zA-Z0-9\-.]+$/, "Alphanumeric characters, - and . only"),
    description: Yup.string().min(0),
    public_access: Yup.string().required(
        "Select who will have access to this dictionary"
    ),
    external_id:Yup.string(),
    website:Yup.string(),
    custom_validation_schema:Yup.string(),
    source_type:Yup.string(),
    default_locale: Yup.string().required("Select a preferred language"),
    supported_locales: Yup.array(Yup.string())
});

const useStyles = makeStyles({
    sourceForm: {
        padding: "2vh 2vw"
    },
    submitButton: {
        textAlign: "center"
    }
});

const SourceForm: React.FC<Props> = ({
                                             onSubmit,
                                             loading,
                                             status, // todo start using this to show action progress
                                             profile,
                                             usersOrgs,
                                             errors,
                                             savedValues
                                         }) => {
    const classes = useStyles();

    const formikRef: any = useRef(null);

    useEffect(() => {
        const { current: currentRef } = formikRef;
        if (currentRef) {
            currentRef.setSubmitting(loading);
        }
    }, [loading]);

    useEffect(() => {
        const { current: currentRef } = formikRef;
        if (currentRef) {
            currentRef.setStatus(status);
        }
    }, [status]);

    useEffect(() => {
        const { current: currentRef } = formikRef;
        if (!currentRef) return;

        Object.keys(initialValues).forEach(key => {
            const error = getPrettyError(
                errors,
                snakeCase(key === "short_code" ? "id" : key) // id and short_code are the same value. error comes back in id
            );
            if (error) currentRef.setFieldError(key, error);
        });
    }, [errors]);

    const supportedLocalesLabel = (values: any) => {
        const labels: Array<JSX.Element> = [];
        LOCALES.filter(
            ({ value }) => value !== values.default_locale
        ).map(({ value, label }) => (
            labels.push(
                <MenuItem key={value} value={value} style={{whiteSpace: 'normal'}}>
                    { label }
                </MenuItem>
            )
        ))
        return labels;
    };

    return (
        <div id="source-form" className={classes.sourceForm}>
            <Formik
                ref={formikRef}
                initialValues={savedValues || initialValues}
                validateOnChange={false}
                validationSchema={SourceSchema}
                onSubmit={(values: Source) => {
                    if (onSubmit) onSubmit(values);
                }}
            >
                {({isSubmitting,values }) => (
                    <Form>
                        <Field
                            // required
                            fullWidth
                            autoComplete="off"
                            id="id"
                            name="id"
                            label="ID"
                            margin="normal"
                            multiline
                            rowsMax={4}
                            component={TextField}
                        />
                        <Field
                            // required
                            fullWidth
                            autoComplete="off"
                            id="short_code"
                            name="short_code"
                            label="Short Code"
                            margin="normal"
                            multiline
                            rowsMax={4}
                            component={TextField}
                        />
                        <Field
                            // required
                            fullWidth
                            autoComplete="off"
                            id="name"
                            name="name"
                            label="Source Name"
                            margin="normal"
                            multiline
                            rowsMax={4}
                            component={TextField}
                        />
                        <Field
                            fullWidth
                            multiline
                            rowsMax={4}
                            id="description"
                            name="description"
                            label="Description"
                            margin="normal"
                            component={TextField}
                        />
                        <FormControl
                            fullWidth
                            // required
                            margin="normal"
                        >
                            <InputLabel htmlFor="owner_url">Owner</InputLabel>
                            <Field
                                value=""
                                disabled={isSubmitting}
                                name="owner_url"
                                id="owner_url"
                                component={Select}
                            >
                                {profile ? (
                                    <MenuItem value={profile.url}>
                                        {profile.username}(You)
                                    </MenuItem>
                                ) : (
                                    ""
                                )}
                                <ListSubheader>Your Organizations</ListSubheader>
                                {usersOrgs.map(org => (
                                    <MenuItem key={org.id} value={org.url}>
                                        {org.name}
                                    </MenuItem>
                                ))}
                            </Field>
                            <Typography color="error" variant="caption" component="div">
                                <ErrorMessage name="owner_url" component="span" />
                            </Typography>
                        </FormControl>
                        <Field
                            // required
                            fullWidth
                            autoComplete="off"
                            id="website"
                            name="website"
                            label="Website"
                            margin="normal"
                            component={TextField}
                        />
                        <Field
                            // required
                            fullWidth
                            autoComplete="off"
                            id="source_type"
                            name="source_type"
                            label="Source type"
                            margin="normal"
                            component={TextField}
                        />
                        <FormControl
                            fullWidth
                            // required
                            margin="normal"
                        >
                            <InputLabel htmlFor="public_access">Visibility</InputLabel>
                            <Field name="public_access" id="public_access" component={Select}>
                                <MenuItem value="View">Public</MenuItem>
                                <MenuItem value="None">Private</MenuItem>
                            </Field>
                            <Typography color="error" variant="caption" component="div">
                                <ErrorMessage name="public_access" component="span" />
                            </Typography>
                        </FormControl>
                        <FormControl
                            fullWidth
                            // required
                            margin="normal"
                        >
                            <InputLabel htmlFor="default_locale">
                                Default Locale
                            </InputLabel>
                            <Field
                                name="default_locale"
                                id="default_locale"
                                component={Select}
                            >
                                {LOCALES.map(({ value, label }) => (
                                    <MenuItem key={value} value={value}>
                                        {label}
                                    </MenuItem>
                                ))}
                            </Field>
                            <Typography color="error" variant="caption" component="div">
                                <ErrorMessage name="default_locale" component="span" />
                            </Typography>
                        </FormControl>
                        <FormControl
                            fullWidth
                            // required
                            margin="normal"
                        >
                            <InputLabel htmlFor="supported_locales">
                                Supported Locale
                            </InputLabel>
                            <Field
                                multiple
                                value={[]}
                                name="supported_locales"
                                id="supported_locales"
                                component={Select}
                            >
                                {supportedLocalesLabel(values)}
                            </Field>
                            <Typography color="error" variant="caption" component="div">
                                <ErrorMessage name="supported_locales" component="span" />
                            </Typography>
                        </FormControl>
                        <Field
                            // required
                            fullWidth
                            multiline
                            rowsMax={4}
                            autoComplete="off"
                            id="custom_validation_schema"
                            name="custom_validation_schema"
                            label="Custom Validation Schema"
                            margin="normal"
                            component={TextField}
                        />
                        <Field
                            // required
                            fullWidth
                            autoComplete="off"
                            id="external_id"
                            name="external_id"
                            label="External Id"
                            margin="normal"
                            component={TextField}
                        />
                        <div className={classes.submitButton}>
                            <Button
                                variant="outlined"
                                color="primary"
                                size="medium"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                Submit
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default SourceForm;
