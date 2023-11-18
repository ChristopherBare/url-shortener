import React, {useState} from 'react';
import Alert from './Alert.tsx';

interface ToastProps {
    message: string;
    status: string;
}

interface DynamicToastChild {
    text: string;
    status: string;
}

const Toast: React.FC<ToastProps> = (props) => {
    const {message, status} = props;
    const [alerts, setAlerts] = useState<DynamicToastChild[]>([]);
    const [initLoad, setInitLoad] = useState(false);
    const handleAddToast = (): void => {
        if (message === '' || status === '') {
            return;
        }
        if (!initLoad) {
            setAlerts([
                {
                    text: message,
                    status: status,
                },
            ]);
            setInitLoad(true);
        } else {
            setAlerts((prevAlerts) => [
                ...prevAlerts,
                {
                    text: message,
                    status: status,
                },
            ]);
        }
    };

    // Removing a toast by index
    const handleRemoveToast = (index: number): void => {
        setAlerts((prevAlerts) => prevAlerts.filter((_, i) => i !== index));
    };

    // Add a new alert on component mount or when props change
    React.useEffect(() => {
        handleAddToast();
    }, [message, status]);

    return (
        <div className="toast toast-end">
            {alerts.map((alert, index) => (
                <Alert
                    key={index}
                    text={alert.text}
                    status={alert.status}
                    onClose={() => handleRemoveToast(index)}
                />
            ))}
        </div>
    );
};

export default Toast;
