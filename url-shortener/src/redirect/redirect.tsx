import {useState, useEffect} from 'react';
import {createClient} from "@supabase/supabase-js";
import {useNavigate, useParams} from "react-router-dom";
// Create a single supabase client for interacting with your database
const supabase = createClient(
    "https://xpzdikragdwewvktxwre.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwemRpa3JhZ2R3ZXd2a3R4d3JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk5MTU3MzksImV4cCI6MjAxNTQ5MTczOX0.Ro6gMNRvindA_dhbL7iNuKGJgm65TcLE4gpX3k8fCCw"
);

const Redirect = () => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const {generatedKey} = useParams<{ generatedKey: string }>();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const {data, error} = await supabase
                    .from('urls')
                    .select('longURL')
                    .eq('generatedKey', generatedKey);

                if (error) {
                    throw new Error(error.message);
                }

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
