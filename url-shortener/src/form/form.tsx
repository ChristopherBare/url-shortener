import '../App.css';
import React, {useEffect, useState} from "react";
import {nanoid} from 'nanoid';
import {isWebUri} from "valid-url";
import {createClient} from '@supabase/supabase-js';
import {useLocation} from "react-router-dom";
import Toast from '../toast/Toast.tsx'

// Create a single supabase client for interacting with your database
const supabase = createClient(
    "https://xpzdikragdwewvktxwre.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwemRpa3JhZ2R3ZXd2a3R4d3JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk5MTU3MzksImV4cCI6MjAxNTQ5MTczOX0.Ro6gMNRvindA_dhbL7iNuKGJgm65TcLE4gpX3k8fCCw"
);

interface FormState {
    longURL: string;
    preferredAlias: string;
    generatedURL: string;
    loading: boolean;
    errors: string[];
    errorMessage: Record<string, string>;
    toolTipMessage: string;
    showAlert: boolean;
    alertText: string;
    alertStatus: string;
}

const Form = () => {
    const [formState, setFormState] = useState<FormState>({
        longURL: '',
        preferredAlias: '',
        generatedURL: '',
        loading: false,
        errors: [],
        errorMessage: {},
        toolTipMessage: 'Copy To Clipboard',
        showAlert: true,
        alertText: '',
        alertStatus: ''
    });
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const urlNotFound = searchParams.get('urlNotFound');

    useEffect(() => {
        document.title = 'small.er';
        if (Boolean(urlNotFound)) {
            showAlert('URL not found.', 'error')
        }
    }, []);

    const showAlert = (text: string, status: string) => {
        setFormState({
            ...formState,
            alertStatus: status,
            alertText: text
        })
    }
    const onSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setFormState((prevState) => ({...prevState, loading: true, generatedURL: ""}));

        const isFormValid = await validateInput();

        if (!isFormValid) {
            return;
        }

        let baseURL = "localhost";
        let generatedKey = nanoid(5);
        let url = `${baseURL}/${generatedKey}`;

        if (formState.preferredAlias !== "") {
            generatedKey = formState.preferredAlias;
            url = `${baseURL}/${formState.preferredAlias}`;
        }

        const {error} = await supabase
            .from("urls")
            .insert(
                [{
                    generatedKey,
                    longURL: formState.longURL,
                    preferredAlias: formState.preferredAlias,
                    generatedURL: url
                }]
            );

        if (error) {
            console.error("Error saving to database: ", error);
            return;
        }

        setFormState((prevState) => ({...prevState, generatedURL: url, loading: false}));
        showAlert("Success!", "success");
    };

    const hasError = (key: string) => {
        return formState.errors.includes(key);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {id, value} = e.target;
        setFormState((prevState) => ({...prevState, [id]: value}));
    };

    const validateInput = async () => {
        const newErrors: string[] = [];
        const newErrorMessages: Record<string, string> = {...formState.errorMessage};

        if (formState.longURL.length === 0) {
            newErrors.push("longURL");
            newErrorMessages["longURL"] = "Please enter your URL!";
        } else if (!isWebUri(formState.longURL)) {
            newErrors.push("longURL");
            newErrorMessages["longURL"] = "Please enter a valid URL!";
        }

        if (formState.preferredAlias !== "") {
            if (formState.preferredAlias.length > 7) {
                newErrors.push("preferredAlias");
                newErrorMessages["preferredAlias"] = "Please enter an alias less than 7 characters";
            } else if (formState.preferredAlias.includes(" ")) {
                newErrors.push("preferredAlias");
                newErrorMessages["preferredAlias"] = "Spaces are not allowed in aliases";
            }
            try {
                const {data, error} = await supabase
                    .from("urls")
                    .select("preferredAlias")
                    .eq("preferredAlias", formState.preferredAlias)
                    .maybeSingle();

                if (error) {
                    console.error("Error checking if key exists: ", error);
                    return false;
                }

                if (data && data.preferredAlias) {
                    newErrors.push("preferredAlias");
                    newErrorMessages["preferredAlias"] = "The alias you entered already exists. Please enter another one.";
                }
            } catch (error: any) {
                console.error(error)
            }
        }

        setFormState((prevState) => ({
            ...prevState,
            errors: newErrors,
            errorMessage: newErrorMessages,
            loading: false
        }));

        return newErrors.length === 0;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(formState.generatedURL).then();
        setFormState((prevState) => ({...prevState, toolTipMessage: "Copied!"}));
    };

    return (

        <div className="flex justify-center items-center h-screen">
            <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                <form autoComplete="off" className="card-body">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Long URL</span>
                        </label>
                        <input
                            id="longURL"
                            type="url"
                            onChange={handleChange}
                            value={formState.longURL}
                            placeholder="https://www..."
                            className={hasError("longURL")
                                ? "input input-error"
                                : "input input-bordered"}
                            required/>
                    </div>
                    <div className={hasError("longURL")
                        ? "text-danger" : "visually-hidden"}>
                        {formState.errorMessage.longUrl}
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Your short URL</span>
                        </label>
                        <div className="form-control">
                            <input
                                id="preferredAlias"
                                onChange={handleChange}
                                value={formState.preferredAlias}
                                maxLength={7}
                                className={
                                    hasError("preferredAlias")
                                        ? "input input-error"
                                        : "input input-bordered"}
                                type="text"
                                placeholder="eg. 3fwias (Optional)"
                            />
                        </div>
                    </div>
                    {
                        formState.generatedURL === '' ?
                            <div></div>
                            :
                            <div id="generatedURL">
                                <span>Your generated URL is: </span>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Custom link</span>
                                    </label>
                                    <input type="text"
                                           value={formState.generatedURL}
                                           readOnly={true}
                                           placeholder="https://shorter.link..."
                                           className="input input-bordered"/>

                                    <button onClick={copyToClipboard} data-toggle="tooltip" data-placement="top"
                                            title="Tooltip on top" className="btn btn-outline-secondary"
                                            type="button">Copy
                                    </button>

                                </div>
                            </div>
                    }
                    <div className="form-control mt-6">
                        <button className="btn btn-primary" onClick={onSubmit}>
                            {
                                formState.loading ?
                                    <span className="loading loading-ring loading-lg"></span>
                                    :
                                    <span>Create</span>
                            }
                        </button>
                    </div>
                </form>
            </div>
            <Toast message={formState.alertText} status={formState.alertStatus}/>
        </div>
    );
};

export default Form;
