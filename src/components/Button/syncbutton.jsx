// nhanh-vn/src/components/ggsheet/syncbutton.jsx
import React, { useState } from "react";
import { Button } from "@mui/material";
import CloudSyncIcon from "@mui/icons-material/CloudSync";
import ConfirmationForm from "@/components/Form/comfirmationForm";

const SyncButton = ({ text = "Sync" }) => {
    const [showConfirm, setShowConfirm] = useState(false);

    const handleConfirm = async () => {
        try {
            const savedConfig = JSON.parse(localStorage.getItem("ggsheetCondition"));
            const sheetFields = JSON.parse(localStorage.getItem("sheetFields")) || [];

            const response = await fetch("/api/ggsheet/sync-data", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    config: savedConfig,
                    sheetFields,
                }),
            });
            const result = await response.json();
            if (result.success) {
                alert("Đồng bộ thành công!");
            }
            setShowConfirm(false);
        } catch (error) {
            console.error("Lỗi đồng bộ:", error);
            alert("Đồng bộ thất bại");
        }
    };

    return (
        <>
            <Button
                variant="contained"
                color="primary"
                startIcon={<CloudSyncIcon />}
                onClick={() => setShowConfirm(true)}
                sx={{
                    position: "fixed",
                    top: 125,
                    right: 20,
                    zIndex: 1000,
                    width: 150,
                    maxWidth: 150,
                }}
            >
                {text}
            </Button>
            <ConfirmationForm
                open={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleConfirm}
                question={`Are you sure you want to ${text.toLowerCase()}?`}
            />
        </>
    );
};

export default SyncButton;