import React from 'react';
import Alert from './Alert.tsx';

interface DynamicToastChild {
    id: string;
    text: string;
    status: string;
}

interface ToastProps {
    alerts: DynamicToastChild[];
    removeAlert: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ alerts, removeAlert }) => {
    return (
        <div className="toast toast-end">
            {alerts.map((alert) => (
                <Alert
                    key={alert.id}
                    text={alert.text}
                    status={alert.status}
                    onClose={() => removeAlert(alert.id)}
                    id={alert.id}
                />
            ))}
        </div>
    );
};

export default Toast;
