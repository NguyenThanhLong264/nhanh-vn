"use client";
import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import reqApiField from "./defaultGGSheetCondition.json";
import { useRouter } from "next/navigation";

const GgSheetPage = () => {
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [values, setValues] = useState(reqApiField);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConditions = async () => {
      try {
        const res = await fetch("api/ggsheet/get_env");
        if (!res.ok) throw new Error("Failed to fetch config");
        const data = await res.json();
        setValues((prev) => ({
          ...prev,
          ...data,
        }));
      } catch (err) {
        console.error("Error loading config:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConditions();
  }, []);

  const handleEdit = () => {
    setValues({ ...values });
    setEditMode(true);
  };

  const handleSave = () => {
    setValues(values);
    setEditMode(false);
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "ggSpreadId",
        values.GGSheetSpreadsheetId // Remove JSON.stringify
      );
    }
  };

  const handleCancel = () => {
    setEditMode(false);
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexDirection: "column",
        width: "500px",
        backgroundColor: "#F5F6FA",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Box
        sx={{
          height: "50px",
          bgcolor: "#3D55CC",
          borderRadius: "8px 8px 0 0",
          p: "8px",
          alignItems: "center",
          display: "flex",
          alignItems: "center",
          color: "#D9E1FC",
          px: "12px",
        }}
      >
        Các Token cần thiết
      </Box>
      <Box sx={{ display: "flex", p: "12px", gap: "12px" }}>
        <Box sx={{ flex: 1 }}>
          {Object.entries(reqApiField).map(([key]) => (
            <Box key={key} sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                {key}
              </Typography>
              <input
                type="text"
                value={editMode ? values[key] || "" : values[key] || ""}
                onChange={(e) =>
                  setValues({ ...values, [key]: e.target.value })
                }
                disabled={!editMode || key !== "GGSheetSpreadsheetId"}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>
      <Box
        sx={{ display: "flex", justifyContent: "center", p: "8px", gap: "8px" }}
      >
        {!editMode ? (
          <>
            <Button
              variant="contained"
              onClick={() => router.push("/ggsheet/mapping")}
            >
              To Mapping
            </Button>
            <Button variant="contained" onClick={handleEdit}>
              Edit
            </Button>
          </>
        ) : (
          <>
            <Button variant="contained" color="success" onClick={handleSave}>
              Save
            </Button>
            <Button variant="contained" color="error" onClick={handleCancel}>
              Cancel
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default GgSheetPage;
