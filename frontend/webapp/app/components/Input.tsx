import { Label, TextInput } from "flowbite-react";
import React from "react";
import { UseControllerProps, useController } from "react-hook-form";

type Props = {
  label: string;
  type?: string;
  showLabel?: string;
} & UseControllerProps<any>;

export default function Input (props: Props) {
  const { fieldState, field } = useController({ ...props, defaultValue: "" });

  return (
    <div className="mb-3">
      <div className="mb-2 block">
        <Label htmlFor={field.name} value={props.label} className="text-slate-700" />
      </div>
      <TextInput
        {...props}
        {...field}
        type={props.type || 'text'}
        placeholder={props.label}
        color={fieldState.error ? 'failure' : !fieldState.isDirty ? '' : 'success'}
        helperText={fieldState.error?.message}
        className="rounded-2xl border border-white/70 bg-white/90 text-slate-800 focus:ring-2 focus:ring-[#5b7bff]/30 focus:border-[#5b7bff]/60"
      />
    </div>
  );
}
