import React, { useEffect } from "react";

interface AlertProps {
    id: string;
    text: string;
    status: string;
    onClose?: () => void;
}

const Alert: React.FC<AlertProps> = (props) => {
    const { text, status, onClose } = props;

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (onClose) {
                onClose();
            }
        }, 30000);


        return () => {
            clearTimeout(timeoutId);
        };
    }, [onClose]);

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };

    return (
        <div className={`alert alert-${status}`}>
            <span>{text}</span>
            <button onClick={handleClose} className="btn btn-sm btn-circle btn-ghost right-4">✕</button>
        </div>
    );
}

export default Alert;
