"use client";
import { useState, useEffect } from "react";
import NormalTable from "@/app/test/Table";
import SpecialTable from "@/app/test/specialTable";
import ProductTable from "@/app/test/productTable";
import CustomFieldsTable from "@/app/test/customFieldTable";
import { Box, Button } from "@mui/material";
import defaultConfig from "@/app/test/defaultConfig.json";
import BackButton from "@/components/ggsheet/backbutton";
import CleanButton from "@/components/ggsheet/cleanbutton";

export default function GGsheetMapPage() {
  console.log("defaultConfig: ", defaultConfig);

  const [rowsConfig, setRowsConfig] = useState([]);

  // Load config từ localStorage hoặc defaultConfig
  useEffect(() => {
    const loadConfig = () => {
      try {
        const savedConfig = localStorage.getItem("ggsheetConfig");
        if (savedConfig) {
          setRowsConfig(JSON.parse(savedConfig));
        } else {
          setRowsConfig(defaultConfig);
        }
      } catch (error) {
        console.error("Error loading config:", error);
        setRowsConfig(defaultConfig);
      }
    };
    loadConfig();
  }, []);

  // Phân loại các loại row
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

  // Cập nhật row
  const handleUpdateRow = (originalIndex, updatedRow) => {
    setRowsConfig((prev) => {
      const newRows = [...prev];
      newRows[originalIndex] = { ...newRows[originalIndex], ...updatedRow };
      return newRows;
    });
  };

  // Lưu config vào localStorage
  const handleSave = () => {
    try {
      localStorage.setItem("ggsheetConfig", JSON.stringify(rowsConfig));
      alert("Configuration saved successfully to localStorage!");
    } catch (error) {
      console.error("Error saving config:", error);
      alert("Failed to save configuration");
    }
  };

  return (
    <Box sx={{ width: "100%", bgcolor: "#F5F6FA" }}>
      <BackButton />
      <CleanButton
        text="Default config"
        storageName={"ggsheetConfig"}
        value={defaultConfig}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        sx={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 1000,
          width: 150,
        }}
      >
        Save Config
      </Button>

      <Box sx={{ p: 3, maxWidth: "1200px", mx: "auto", bgcolor: "#F5F6FA" }}>
        <NormalTable
          title="Normal Fields"
          rows={normalRows}
          onUpdateRow={handleUpdateRow}
          customWebhookFields={defaultConfig}
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
          nhanhProductFields={defaultConfig}
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
