
"use client"
import React, { useState, useEffect } from "react";
import { Text } from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Select, SingleValue } from "chakra-react-select";
import { supabase } from "@/lib/supabase";

interface OptionType {
  label: string;
  value: string;
}

interface SupabaseSelectProps {
  label: string;
  tableName: string;
  displayColumn: string;
  valueColumn?: string;
  value: string;
  onChange: (val: string) => void;
  isRequired?: boolean;
  filterColumn?: string;
  filterValue?: string;
}

export const SupabaseSelect: React.FC<SupabaseSelectProps> = ({
                                                                label,
                                                                tableName,
                                                                displayColumn,
                                                                valueColumn,
                                                                value,
                                                                onChange,
                                                                isRequired,
                                                                filterColumn,
                                                                filterValue,
                                                              }) => {
  const [options, setOptions] = useState<OptionType[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setError(null);
        // Build the select columns: if valueColumn is provided, combine it with displayColumn.
        const columns = valueColumn
          ? `${valueColumn},${displayColumn}`
          : displayColumn;
        let query = supabase.from(tableName).select(columns);

        // Apply filter if both filterColumn and filterValue are provided
        if (filterColumn && filterValue !== undefined) {
          query = query.eq(filterColumn, filterValue);
        }
        const { data, error: fetchError } = await query;
        if (fetchError) throw fetchError;
        if (!data) {
          setOptions([]);
          return;
        }
        // Use valueColumn for value if available, otherwise fallback to displayColumn
        const fieldForValue = valueColumn || displayColumn;
        const list = data.map((row: any) => ({
          label: row[displayColumn],
          value: row[fieldForValue],
        }));
        // Remove duplicates using a Map keyed on value
        const uniqueOptions = Array.from(
          new Map(list.map((item) => [item.value, item])).values()
        );
        setOptions(uniqueOptions);
      } catch (err: any) {
        console.error("Error fetching options:", err);
        setError(err.message || "Failed to fetch data");
        setOptions([]);
      }
    }
    fetchData();
  }, [tableName, displayColumn, valueColumn, filterColumn, filterValue]);

  function handleSelectChange(newValue: SingleValue<OptionType>) {
    if (!newValue) {
      onChange("");
      return;
    }
    onChange(newValue.value);
  }

  // Convert the current value string to the corresponding option, if it exists.
  const selectedOption =
    value !== ""
      ? options.find((opt) => opt.value === value) || { label: value, value }
      : null;

  return (
    <FormControl mb={4} isRequired={isRequired}>
      <FormLabel color="gray.300" mb={4}>{label}</FormLabel>
      <Select<OptionType>
        placeholder="Select a value"
        options={options}
        value={selectedOption}
        onChange={handleSelectChange}
        chakraStyles={{
          container: (provided) => ({ ...provided, bg: "#2a2a2a" }),
          control: (provided) => ({
            ...provided,
            bg: "#2a2a2a",
            color: "white",
          }),
          menuList: (provided) => ({ ...provided, bg: "#1a1a1a" }),
          option: (provided) => ({
            ...provided,
            backgroundColor: "#1a1a1a",
            color: "white",
            ":hover": { backgroundColor: "#333" },
          }),
          placeholder: (provided) => ({ ...provided, color: "gray.400" }),
          singleValue: (provided) => ({ ...provided, color: "white" }),
        }}
      />
      {error && (
        <Text color="red.400" mt={2}>
          {error}
        </Text>
      )}
    </FormControl>
  );
};
