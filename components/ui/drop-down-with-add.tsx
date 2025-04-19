"use client"

import { useEffect, useState } from "react"
import { Box, Button, Flex, Input, Text } from "@chakra-ui/react"
import { supabase } from "@/lib/supabase"
import { Select } from "chakra-react-select"

interface CustomOption {
  label: string
  value: string
}

interface AddableSupabaseSelectProps {
  label?: string
  tableName: string
  displayColumn: string
  value: string | null
  onChange: (val: string) => void
  isrequired?: boolean
  filterColumn?: string
  filterValue?: string
  valueColumn?: string // Optional - if not provided, displayColumn will be used for both label and value
}

/**
 * A "custom select" that fetches items from Supabase,
 * displays them in a chakra-react-select dropdown,
 * and includes an inline "Add new item" flow.
 */
export function AddableSupabaseSelect({
                                        label,
                                        tableName,
                                        displayColumn,
                                        value,
                                        onChange,
                                        isrequired,
                                        filterColumn,
                                        filterValue,
                                        valueColumn,
                                      }: AddableSupabaseSelectProps) {
  // Our list of options, shaped for React Select
  const [options, setOptions] = useState<CustomOption[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newValue, setNewValue] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Fetch data on mount or if tableName/displayColumn changes
  useEffect(() => {
    fetchData()
  }, [tableName, displayColumn, filterColumn, filterValue, valueColumn])

  async function fetchData() {
    try {
      setError(null)
      // Build the select columns: if valueColumn is provided, combine it with displayColumn.
      const columns = valueColumn ? `${valueColumn},${displayColumn}` : displayColumn
      let query = supabase.from(tableName).select(columns)

      // Apply filter if both filterColumn and filterValue are provided
      if (filterColumn && filterValue !== undefined) {
        query = query.eq(filterColumn, filterValue)
      }
      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError
      if (!data) {
        setOptions([])
        return
      }

      // Use valueColumn for value if available, otherwise fallback to displayColumn
      const fieldForValue = valueColumn || displayColumn
      const list = data.map((row: any) => ({
        label: row[displayColumn],
        value: row[fieldForValue],
      }))

      // Remove duplicates using a Map keyed on value
      const uniqueOptions = Array.from(new Map(list.map((item) => [item.value, item])).values())
      setOptions(uniqueOptions)
    } catch (err: any) {
      console.error("Error fetching options:", err)
      setError(err.message || "Failed to fetch data")
      setOptions([])
    }
  }

  // Insert a new row into Supabase
  async function insertItem(newText: string) {
    try {
      const { error: insertError } = await supabase
        .from(tableName)
        .insert([{ [displayColumn]: newText }])
        .single()
      if (insertError) throw insertError
    } catch (err: any) {
      console.error("Error inserting item:", err)
      throw err
    }
  }

  function handleSelectChange(selected: any) {
    if (!selected) {
      // they cleared the selection
      onChange("")
      return
    }
    if (selected.value === "__add_new__") {
      // user clicked "Add new item" option
      setIsAdding(true)
    } else {
      // If valueColumn is not provided, we want to store the display value (label)
      // This ensures we show the name instead of ID in the field
      if (!valueColumn && selected.label) {
        onChange(selected.label)
      } else {
        onChange(selected.value)
      }
    }
  }

  async function handleAddClick() {
    const trimmed = newValue.trim()
    if (!trimmed) return

    try {
      await insertItem(trimmed)
      await fetchData() // Refresh the list
      // auto-select newly added item
      onChange(trimmed)
      setIsAdding(false)
      setNewValue("")
    } catch (err: any) {
      console.error("Error adding new item:", err)
      setError(err.message || "Failed to add item")
    }
  }

  function handleCancel() {
    setIsAdding(false)
    setNewValue("")
  }

  // We'll merge a special "Add new item" option into the dropdown items
  const allOptions = [...options, { label: "+ Add New Item", value: "__add_new__" }]

  // Find the matching option for the current value
  // If valueColumn is not provided, match by label instead of value
  const selectedOption = value
    ? options.find((opt) => (!valueColumn ? opt.label === value : opt.value === value)) || {
    label: value,
    value,
  }
    : null

  if (isAdding) {
    // Show a small inline "Add new" input
    return (
      <Box mb={4}>
        {label && <Text mb={1}>{label}</Text>}
        <Flex gap={2} align="center">
          <Input
            placeholder="Enter new item"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            autoFocus
            bg="#2a2a2a"
            borderColor="#3a3a3a"
            color="white"
          />
          <Button colorScheme="green" onClick={handleAddClick} disabled={!newValue.trim()}>
            Add
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </Flex>
        {error && (
          <Text color="red.400" mt={2}>
            {error}
          </Text>
        )}
      </Box>
    )
  }

  // normal select mode
  return (
    <Box mb={4}>
      {label && <Text mb={1}>{label}</Text>}
      <Select
        placeholder="Select an item"
        value={selectedOption}
        options={allOptions}
        onChange={handleSelectChange}
        // Chakra React Select is heavily theme-based; you can add more styling via props
        chakraStyles={{
          container: (provided) => ({
            ...provided,
            bg: "#2a2a2a",
          }),
          menuList: (provided) => ({
            ...provided,
            bg: "#1a1a1a",
          }),
          option: (provided) => ({
            ...provided,
            // Adjust colors or states
            backgroundColor: "#1a1a1a",
            color: "#fff",
            "&:hover": {
              backgroundColor: "#333",
            },
          }),
        }}
      />
      {error && (
        <Text color="red.400" mt={2}>
          {error}
        </Text>
      )}
    </Box>
  )
}
