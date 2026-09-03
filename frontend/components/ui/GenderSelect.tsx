"use client";

import React from "react";
import { CustomSelect, CustomSelectOption } from "./CustomSelect";

interface GenderSelectProps {
  label?: string;
  sublabel?: string;
  value: string;
  onChange: (gender: string) => void;
}

const GENDER_OPTIONS: CustomSelectOption[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "non_binary", label: "Non-binary / Fluid" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export function GenderSelect({
  label = "Gender Identity",
  sublabel,
  value,
  onChange,
}: GenderSelectProps) {
  return (
    <CustomSelect
      label={label}
      sublabel={sublabel}
      placeholder="Select gender identity"
      options={GENDER_OPTIONS}
      value={value}
      onChange={onChange}
    />
  );
}
