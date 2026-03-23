import React from "react";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import Select from "react-select";

interface AsyncDropdownProps<TItem, TFormValues extends FieldValues> {
  name: Path<TFormValues>;
  control: Control<TFormValues>;
  label: string;
  placeholder: string;
  collection: { items: TItem[] };
  renderItem: (item: TItem) => string;
  itemToKey: (item: TItem) => string | number;
  isLoading?: boolean;
  multiple?: boolean;
  disabled?: boolean;
}

const selectStyles = {
  control: (base: object, state: { isFocused: boolean }) => ({
    ...base,
    backgroundColor: "#262626",
    borderColor: state.isFocused ? "#737373" : "#404040",
    boxShadow: "none",
    "&:hover": { borderColor: "#737373" },
    minHeight: "38px",
  }),
  menu: (base: object) => ({
    ...base,
    backgroundColor: "#262626",
    border: "1px solid #404040",
  }),
  option: (base: object, state: { isFocused: boolean; isSelected: boolean }) => ({
    ...base,
    backgroundColor: state.isSelected ? "#404040" : state.isFocused ? "#333333" : "transparent",
    color: "#f5f5f5",
    "&:active": { backgroundColor: "#404040" },
  }),
  multiValue: (base: object) => ({
    ...base,
    backgroundColor: "#404040",
  }),
  multiValueLabel: (base: object) => ({
    ...base,
    color: "#f5f5f5",
  }),
  multiValueRemove: (base: object) => ({
    ...base,
    color: "#a3a3a3",
    "&:hover": { backgroundColor: "#525252", color: "#f5f5f5" },
  }),
  singleValue: (base: object) => ({
    ...base,
    color: "#f5f5f5",
  }),
  placeholder: (base: object) => ({
    ...base,
    color: "#737373",
  }),
  input: (base: object) => ({
    ...base,
    color: "#f5f5f5",
  }),
  clearIndicator: (base: object) => ({
    ...base,
    color: "#737373",
    "&:hover": { color: "#f5f5f5" },
  }),
  dropdownIndicator: (base: object) => ({
    ...base,
    color: "#737373",
    "&:hover": { color: "#f5f5f5" },
  }),
  indicatorSeparator: (base: object) => ({
    ...base,
    backgroundColor: "#404040",
  }),
  menuPortal: (base: object) => ({
    ...base,
    zIndex: 10000,
  }),
};

export function AsyncDropdown<TItem, TFormValues extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  collection,
  renderItem,
  itemToKey,
  isLoading = false,
  multiple = false,
  disabled = false,
}: AsyncDropdownProps<TItem, TFormValues>) {
  const options = collection.items.map((item) => ({
    value: String(itemToKey(item)),
    label: renderItem(item),
  }));

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-neutral-300 mb-1">{label}</label>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => {
          const currentValues: string[] = Array.isArray(field.value)
            ? field.value.map(String)
            : [];

          const selected = multiple
            ? options.filter((o) => currentValues.includes(o.value))
            : options.find((o) => o.value === currentValues[0]) ?? null;

          return (
            <>
              <Select
                isMulti={multiple}
                isLoading={isLoading}
                isDisabled={disabled || isLoading}
                options={options}
                value={selected}
                placeholder={placeholder}
                styles={selectStyles as object}
                onChange={(chosen) => {
                  if (multiple) {
                    const vals = (chosen as unknown as { value: string }[]).map((o) => o.value);
                    field.onChange(vals);
                  } else {
                    const val = (chosen as { value: string } | null)?.value;
                    field.onChange(val ? [val] : []);
                  }
                }}
                menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                menuPosition="fixed"
              />
              {fieldState.error && (
                <p className="text-red-400 text-xs mt-1">{fieldState.error.message}</p>
              )}
            </>
          );
        }}
      />
    </div>
  );
}
