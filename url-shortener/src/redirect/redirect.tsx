import { useState, useEffect } from 'react';
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
  const { generatedKey } = useParams();
  console.log(generatedKey);

  useEffect(() => {
    // Fetch the URL from Supabase based on the generatedKey parameter
    supabase
        .from('urls')
        .select('longURL')
        .eq('generatedKey', generatedKey)
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching URL:', error.message);
            setLoading(false);
            // Handle fetch error, e.g., show a generic error page or redirect to home
            navigate('/');
            return;
          }

          if (data && data.length > 0 && data[0].longURL) {
            window.location.href = data[0].longURL; // Redirect to the fetched URL
          } else {
            console.error('URL not found');
            // Handle error, e.g., show a 404 page or redirect to home
            navigate('/');
          }
          setLoading(false);
        });
  }, [generatedKey, navigate]);

  return loading ? <div>Loading...</div> : null;
};
export default Redirect;
