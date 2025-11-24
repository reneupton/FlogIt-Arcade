import React from "react";
import { UseControllerProps, useController } from "react-hook-form";
import DatePicker, { ReactDatePickerProps } from "react-datepicker";

type Props = {
  label: string;
  type?: string;
  showLabel?: string;
} & UseControllerProps<any> &
  Partial<ReactDatePickerProps>;

export default function DateInput(props: Props) {
  const { fieldState, field } = useController({ ...props, defaultValue: "" });

  return (
    <div className="block">
      <div className="mb-2 text-sm font-medium text-slate-700">{props.label}</div>
      <DatePicker
        {...props}
        {...field}
        onChange={(value) => field.onChange(value)}
        selected={field.value}
        placeholderText={props.label}
        className={`
            rounded-2xl w-[100%] flex flex-col px-3 py-3 border
            bg-white/90 text-slate-800
            ${
              fieldState.error
                ? "bg-red-50 border-red-500 text-red-900"
                : !fieldState.invalid && fieldState.isDirty
                ? "border-[#5b7bff]/60"
                : "border-white/70"
            }
            focus:outline-none focus:ring-2 focus:ring-[#5b7bff]/30
        `}
      />
      {fieldState.error && (
        <div className='text-red-500 text-sm'>{fieldState.error.message}</div>
      )}
    </div>
  );
}
