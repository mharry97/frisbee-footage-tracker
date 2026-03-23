import React from "react";
import { Controller, Control, FieldValues, Path } from "react-hook-form";

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
          return (
            <>
              <select
                disabled={disabled || isLoading}
                multiple={multiple}
                value={multiple ? currentValues : (currentValues[0] ?? "")}
                onChange={(e) => {
                  if (multiple) {
                    const selected = Array.from(
                      e.target.selectedOptions,
                      (opt) => opt.value
                    );
                    field.onChange(selected);
                  } else {
                    const val = e.target.value;
                    field.onChange(val ? [val] : []);
                  }
                }}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-neutral-100 text-sm focus:outline-none focus:border-neutral-500 disabled:opacity-50"
              >
                {!multiple && <option value="">{placeholder}</option>}
                {collection.items.map((item) => {
                  const value = String(itemToKey(item));
                  return (
                    <option key={value} value={value}>
                      {renderItem(item)}
                    </option>
                  );
                })}
              </select>
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
