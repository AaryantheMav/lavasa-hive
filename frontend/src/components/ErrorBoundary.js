// src/components/ErrorBoundary.js
import React from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogContentText, 
    Button 
} from '@mui/material';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false,
            error: null,
            errorInfo: null 
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error,
            errorInfo
        });
        // Log error to error reporting service
        console.error("Uncaught error:", error, errorInfo);
    }

    handleRecover = () => {
        this.setState({ hasError: false });
    }

    render() {
        if (this.state.hasError) {
            return (
                <Dialog open={true} onClose={this.handleRecover}>
                    <DialogTitle>Something Went Wrong</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            An unexpected error occurred. Please try again later.
                        </DialogContentText>
                        <Button 
                            onClick={this.handleRecover} 
                            color="primary" 
                            variant="contained"
                        >
                            Recover
                        </Button>
                    </DialogContent>
                </Dialog>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;