import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    Box,
    Typography,
    CircularProgress
} from '@mui/material';

const PaymentOverlay = ({ open, onComplete }) => {
    const [countdown, setCountdown] = useState(15);

    useEffect(() => {
        let timer;
        if (open && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else if (countdown === 0) {
            onComplete();
        }
        return () => clearInterval(timer);
    }, [open, countdown, onComplete]);

    return (
        <Dialog
            open={open}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    textAlign: 'center',
                    padding: 2
                }
            }}
        >
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Scan the QR code to pay ₹10
                </DialogContentText>
                <Box sx={{ my: 3 }}>
                    {/* Replace this URL with your GPay QR code image */}
                    <img 
                        src="/your-gpay-qr.jpg" 
                        alt="GPay QR Code" 
                        style={{ 
                            width: '200px', 
                            height: '200px',
                            border: '1px solid #ddd',
                            padding: '10px'
                        }} 
                    />
                </Box>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress variant="determinate" value={(countdown/15) * 100} />
                    <Box
                        sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: 'absolute',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Typography variant="caption" component="div" color="text.secondary">
                            {countdown}s
                        </Typography>
                    </Box>
                </Box>
                <Typography variant="body2" sx={{ mt: 2 }}>
                    Payment verification in {countdown} seconds...
                </Typography>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentOverlay;