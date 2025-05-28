"use client";
import { useState, useEffect } from "react";
import NormalTable from "@/components/Table/Table.jsx";
import SpecialTable from "@/components/Table/specialTable";
import ProductTable from "@/components/Table/productTable";
import CustomFieldsTable from "@/components/Table/customFieldTable";
import { Box, Button } from "@mui/material";
import defaultConfig from "@/app/test/defaultConfig.json";
import { GUIDE_TEXT } from "./guideText";
import BackButton from "@/components/Button/backbutton";
import CleanButton from "@/components/Button/cleanbutton";
import GuideButton from "@/components/Button/guidebutton";
import SyncButton from "@/components/Button/syncbutton";

export default function GGsheetMapPage() {
  const [rowsConfig, setRowsConfig] = useState([]);
  const [sheetFields, setSheetFields] = useState(null);

  // Gọi API để lấy dữ liệu hàng đầu tiên
  useEffect(() => {
    // console.log("ggSpreadId:", localStorage.getItem("ggSpreadId"));
    const fetchFirstRow = async () => {
      try {
        const response = await fetch("/api/ggsheet/get_1st_row", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            spreadsheetId: localStorage.getItem("ggSpreadId"), // Chuỗi bạn muốn phân tích
          }),
        });
        if (!response.ok) throw new Error("API request failed");
        const data = await response.json();
        setSheetFields(data);
        localStorage.setItem("sheetFields", JSON.stringify(data));
      } catch (error) {
        console.error("Error fetching first row:", error);
      }
    };
    fetchFirstRow();
  }, []);

  // Load config từ localStorage hoặc defaultConfig
  useEffect(() => {
    const loadConfig = () => {
      try {
        const savedConfig = localStorage.getItem("ggsheetConfig");
        const savedSheetFields = localStorage.getItem("sheetFields");

        if (savedSheetFields) {
          setSheetFields(JSON.parse(savedSheetFields));
        }

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
      <SyncButton />
      <GuideButton tooltipText={GUIDE_TEXT} />

      <Box sx={{ p: 3, maxWidth: "1200px", mx: "auto", bgcolor: "#F5F6FA" }}>
        <NormalTable
          title="Normal Fields"
          rows={normalRows}
          onUpdateRow={handleUpdateRow}
          customWebhookFields={sheetFields}
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
