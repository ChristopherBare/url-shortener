import '../App.css';
import {useEffect, useState} from "react";
import {nanoid} from 'nanoid';
import { isWebUri } from "valid-url";
import { createClient } from '@supabase/supabase-js';
// Create a single supabase client for interacting with your database
const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL || "https://xpzdikragdwewvktxwre.supabase.co",
    process.env.REACT_APP_SUPABASE_API_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwemRpa3JhZ2R3ZXd2a3R4d3JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk5MTU3MzksImV4cCI6MjAxNTQ5MTczOX0.Ro6gMNRvindA_dhbL7iNuKGJgm65TcLE4gpX3k8fCCw"
);


// const supabase = createClient('', '')

interface FormState {
    longURL: string;
    preferedAlias: string;
    generatedURL: string;
    loading: boolean;
    errors: string[];
    errorMessage: Record<string, string>;
    toolTipMessage: string;
}
const Form = () => {
    const [formState, setFormState] = useState<FormState>({
        longURL: '',
        preferedAlias: '',
        generatedURL: '',
        loading: false,
        errors: [],
        errorMessage: {},
        toolTipMessage: 'Copy To Clipboard',
    });
   useEffect(() => {
        document.title = 'small.er';
    }, []);

    const onSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setFormState((prevState) => ({ ...prevState, loading: true, generatedURL: '' }));

        const isFormValid = await validateInput();

        if (!isFormValid) {
            return;
        }

        let generatedKey = nanoid(5);
        let url = `minilinkit.com/${generatedKey}`;

        if (formState.preferedAlias !== '') {
            generatedKey = formState.preferedAlias;
            url = `minilinkit.com/${formState.preferedAlias}`;
        }

        const db = getDatabase();
        set(ref(db, `/${generatedKey}`), {
            generatedKey,
            longURL: formState.longURL,
            preferedAlias: formState.preferedAlias,
            generatedURL: url,
        })
            .then(() => {
                setFormState((prevState) => ({ ...prevState, generatedURL: url, loading: false }));
            })
            .catch((error) => {
                console.error('Error saving to database: ', error);
            });
    };

    const hasError = (key: string) => {
        return formState.errors.includes(key);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormState((prevState) => ({ ...prevState, [id]: value }));
    };

    const validateInput = async () => {
        const newErrors: string[] = [];
        const newErrorMessages: Record<string, string> = { ...formState.errorMessage };

        if (formState.longURL.length === 0) {
            newErrors.push('longURL');
            newErrorMessages['longURL'] = 'Please enter your URL!';
        } else if (!isWebUri(formState.longURL)) {
            newErrors.push('longURL');
            newErrorMessages['longURL'] = 'Please enter a valid URL!';
        }

        if (formState.preferedAlias !== '') {
            if (formState.preferedAlias.length > 7) {
                newErrors.push('preferedAlias');
                newErrorMessages['preferedAlias'] = 'Please enter an alias less than 7 characters';
            } else if (formState.preferedAlias.includes(' ')) {
                newErrors.push('preferedAlias');
                newErrorMessages['preferedAlias'] = 'Spaces are not allowed in aliases';
            }

            // const keyExists = await checkKeyExists();

            if (keyExists.exists()) {
                newErrors.push('preferedAlias');
                newErrorMessages['preferedAlias'] = 'The alias you entered already exists. Please enter another one.';
            }
        }

        setFormState((prevState) => ({ ...prevState, errors: newErrors, errorMessage: newErrorMessages, loading: false }));

        return newErrors.length === 0;
    };

    // const checkKeyExists = async () => {
    //     const dbRef = ref(getDatabase());
    //     return get(child(dbRef, `/${formState.preferedAlias}`)).catch(() => {
    //         return false;
    //     });
    // };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(formState.generatedURL);
        setFormState((prevState) => ({ ...prevState, toolTipMessage: 'Copied!' }));
    };
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                <form className="card-body">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Long URL</span>
                        </label>
                        <input type="email" placeholder="https://www..." className="input input-bordered" required />
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Custom link</span>
                        </label>
                        <input type="password" placeholder="https://shorter.link..." className="input input-bordered" required />
                        {/*<label className="label">*/}
                        {/*    <a href="#" className="label-text-alt link link-hover">*/}
                        {/*        Forgot password?*/}
                        {/*    </a>*/}
                        {/*</label>*/}
                    </div>
                    <div className="form-control mt-6">
                        <button className="btn btn-primary">Create</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Form;
