import React from "react";
import {
  createListCollection,
  Field,
  Select,
  Spinner,
} from "@chakra-ui/react";
import { Controller, Control, FieldValues, Path } from "react-hook-form";

interface AsyncDropdownProps<TItem, TFormValues extends FieldValues> {
  name: Path<TFormValues>;
  control: Control<TFormValues>;
  label: string;
  placeholder: string;
  collection: ReturnType<typeof createListCollection<TItem>>;
  renderItem: (item: TItem) => React.ReactNode;
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
    <Field.Root mb={4}>
      <Field.Label>{label}</Field.Label>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <>
            <Select.Root
              name={field.name}
              value={field.value}
              onValueChange={({ value }) => field.onChange(value)}
              onInteractOutside={() => field.onBlur()}
              multiple={multiple}
              collection={collection}
              disabled={disabled}
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder={placeholder} />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  {isLoading && <Spinner />}
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Select.Positioner>
                <Select.Content>
                  {collection.items.map((item) => (
                    <Select.Item item={item} key={itemToKey(item)}>
                      {renderItem(item)}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Select.Root>
            {fieldState.error && (
              <Field.ErrorText>{fieldState.error.message}</Field.ErrorText>
            )}
          </>
        )}
      />
    </Field.Root>
  );
}
