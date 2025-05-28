// nhanh-vn/src/components/ggsheet/syncbutton.jsx
"use client";
import React, { useState } from "react";
import { Button } from "@mui/material";
import CloudSyncIcon from "@mui/icons-material/CloudSync";
import ConfirmationForm from "@/components/Form/comfirmationForm";
import SyncProcessForm from "../Form/SyncProcessForm";

const SyncButton = ({ text = "Sync" }) => {
  const [showPrepare, setShowPrepare] = useState(false);
  const [showStartSync, setShowStartSync] = useState(false);
  const [showSyncProcess, setShowSyncProcess] = useState(false);
  const [syncObjs, setSyncObjs] = useState([]);
  const [syncItems, setSyncItems] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleConfirm = async () => {
    const sheetFields = JSON.parse(localStorage.getItem("sheetFields"));
    const spreadId = localStorage.getItem("ggSpreadId");
    setShowPrepare(false);
    const res = await fetch("/api/ggsheet/sync-data/prepare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        spreadsheetId: spreadId,
        headers: sheetFields,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      console.error("Lỗi:", err.error);
      return;
    }
    const data = await res.json();
    console.log("Data:", data);
    setSyncObjs(data.objs);
    setSyncItems(data.total);
    setShowStartSync(true);
  };

  const handleSync = async () => {
    const config = localStorage.getItem("ggsheetConfig");
    if (!config) {
      console.error("No config found in localStorage");
      return;
    }

    try {
      const parsedConfig = JSON.parse(config);
      setShowStartSync(false);
      setCurrentIndex(0);
      setShowSyncProcess(true);

      for (let i = 0; i < syncObjs.length; i++) {
        const obj = syncObjs[i];
        setCurrentIndex(i);
        try {
          const res = await fetch("/api/ggsheet/sync-data/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              config: parsedConfig,
              obj: obj,
            }),
          });

          const result = await res.json();

          if (!res.ok) {
            throw new Error(result.error || "Unknown error");
          }
          console.log(`✅ Synced item ${i + 1}/${syncObjs.length}`);
        } catch (error) {
          console.error(`❌ Error syncing item ${i + 1}:`, error.message);
        }
        await new Promise((r) => setTimeout(r, 100));
      }
    } catch (parseError) {
      console.error("Invalid config in localStorage:", parseError);
    } finally {
      setShowSyncProcess(false)
      alert("Sync completed")
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<CloudSyncIcon />}
        onClick={() => setShowPrepare(true)}
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
        open={showPrepare}
        onClose={() => setShowPrepare(false)}
        onConfirm={handleConfirm}
        question={`Are you sure you want to ${text.toLowerCase()}?`}
      />
      <ConfirmationForm
        open={showStartSync}
        onClose={() => setShowStartSync(false)}
        onConfirm={handleSync}
        question={`Do you want to sync ${syncItems} items?`}
      />
      <SyncProcessForm
        open={showSyncProcess}
        progress={currentIndex}
        total={syncItems}
      />
    </>
  );
};

export default SyncButton;
