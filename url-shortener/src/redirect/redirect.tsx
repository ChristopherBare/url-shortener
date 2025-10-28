// noinspection ExceptionCaughtLocallyJS

import {useState, useEffect} from 'react';
import {createClient} from "@supabase/supabase-js";
import {useNavigate, useParams} from "react-router-dom";
import 'dotenv';
// Create a single supabase client for interacting with your database
const supabaseUrl = "https://aoeugzsuxlvofoysokry.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string;

const supabase = createClient(supabaseUrl, supabaseKey);


const Redirect = () => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const {generatedKey} = useParams<{ generatedKey: string }>();

    useEffect(() => {
        document.title = 'small.er';
        const fetchData = async () => {
            try {
                const {data, error} = await supabase
                    .from('urls')
                    .select('longURL')
                    .eq('generatedKey', generatedKey);

                if (error) throw new Error(error.message);

                if (data && data.length > 0 && data[0].longURL) {
                    window.location.href = data[0].longURL;
                } else {
                    console.error('URL not found');
                    navigate('/?urlNotFound=true'); // Redirect to home if URL not found
                }
            } catch (error: any) {
                console.error('Error fetching URL:', error.message);
                navigate('/'); // Redirect to home on fetch error
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [generatedKey, navigate]);

    return loading ? <div>Loading...</div> : null;
};

export default Redirect;
