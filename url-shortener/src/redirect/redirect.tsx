// noinspection ExceptionCaughtLocallyJS

import {useState, useEffect} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import {dynamodbService} from '../services/dynamodb';
import 'dotenv';

const Redirect = () => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const {generatedKey} = useParams<{ generatedKey: string }>();

    useEffect(() => {
        document.title = 'small.er';
        const fetchData = async () => {
            try {
                const urlEntry = await dynamodbService.getUrlByKey(generatedKey || '');

                if (urlEntry && urlEntry.longURL) {
                    window.location.href = urlEntry.longURL;
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
