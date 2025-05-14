"use client";

import { useState, useEffect } from "react";
import NormalTable from "./Table";
import SpecialTable from "./specialTable";
import ProductTable from "./productTable";
import CustomFieldsTable from "./customFieldTable";
import Topbar from "@/components/nhanh/TopBar";
import { Box } from "@mui/material";

export default function Page() {
  const [rowsConfig, setRowsConfig] = useState([]);
  const normalRows = rowsConfig
    .map((row, index) => ({ ...row, originalIndex: index }))
    .filter((row) => row.typeInput === "normal" || row.typeInput === "map");
  const specialRows = rowsConfig
    .map((row, index) => ({ ...row, originalIndex: index }))
    .filter(
      (row) => row.typeInput === "pipeline_stage" || row.typeInput === "status"
    );
  const productRows = rowsConfig
    .map((row, index) => ({ ...row, originalIndex: index }))
    .filter((row) => row.typeInput === "product");
  const customRows = rowsConfig
    .map((row, index) => ({ ...row, originalIndex: index }))
    .filter((row) => row.typeInput === "custom");

  useEffect(() => {
    async function loadConfig() {
      try {
        // Fix the path to be relative to the current directory
        const response = await fetch("/api/test/config");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setRowsConfig(data);
      } catch (error) {
        console.error("Error loading config:", error);
        // Set default empty array to prevent undefined errors
        setRowsConfig([]);
      }
    }

    loadConfig();
  }, []);

  // --- Update a row ---
  const handleUpdateRow = (originalIndex, updatedRow) => {
    setRowsConfig((prev) => {
      const newRows = [...prev];
      newRows[originalIndex] = { ...newRows[originalIndex], ...updatedRow };
      return newRows;
    });
  };

  // --- Save current state to newConfig.json ---
  const handleSave = async () => {
    try {
      const response = await fetch("/api/test/save-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rowsConfig),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      alert("Configuration saved successfully!");
    } catch (error) {
      console.error("Error saving config:", error);
      alert("Failed to save configuration");
    }
  };

  console.log("Row config:", rowsConfig);
  // console.log("Normal Rows:", normalRows);
  // console.log("Special Rows:", specialRows);
  // console.log("Product Rows:", productRows);
  // console.log("Custom Rows:", customRows);

  return (
    <Box sx={{ width: '100%', bgcolor: "#F5F6FA" }}>
      <Topbar onSaveConfig={handleSave} />
      <Box
        sx={{
          p: 3,
          maxWidth: "1200px",
          mx: "auto",
          bgcolor: "#F5F6FA",
        }}
      >
        <NormalTable
          title="Normal Fields"
          rows={normalRows}
          onUpdateRow={handleUpdateRow}
        />

        <SpecialTable
          title="Special Fields"
          rows={specialRows}
          onUpdateRow={handleUpdateRow}
        />
        <ProductTable
          title="Order Product Fields"
          rows={productRows}
          onUpdateRow={handleUpdateRow}
        />
        <CustomFieldsTable
          title="Custom Fields"
          rows={customRows}
          onUpdateRow={handleUpdateRow}
        />
      </Box>
    </Box>
  );
}
