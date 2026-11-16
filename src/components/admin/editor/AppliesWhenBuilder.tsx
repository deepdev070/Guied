"use client";

import React, { useMemo } from "react";
import { Filter, Info } from "lucide-react";

export interface AppliesWhenBuilderProps {
  value: unknown;
  onChange: (newValue: Record<string, unknown> | null) => void;
}

const COMMON_FIELDS = [
  { id: "applicantAge", label: "Applicant Age (Years)" },
  { id: "vehicleType", label: "Vehicle Type / Class" },
  { id: "applicantState", label: "Applicant State" },
  { id: "hasExistingLicence", label: "Has Existing Licence" },
  { id: "hasExistingPassport", label: "Has Existing Passport" },
  { id: "isMinor", label: "Is Minor (< 18)" },
  { id: "isSenior", label: "Is Senior Citizen (>= 60)" },
  { id: "applicantCategory", label: "Applicant Category" },
];

const OPERATORS = [
  { id: "eq", label: "Equals (=)" },
  { id: "ne", label: "Does Not Equal (!=)" },
  { id: "gte", label: "Greater Than or Equal (>=)" },
  { id: "gt", label: "Greater Than (>)" },
  { id: "lte", label: "Less Than or Equal (<=)" },
  { id: "lt", label: "Less Than (<)" },
  { id: "in", label: "One Of (Comma Separated)" },
];

function parseRule(value: unknown) {
  if (!value || typeof value !== "object" || Object.keys(value).length === 0) {
    return { enabled: false, field: "applicantAge", operator: "gte", targetValue: "40" };
  }

  const entries = Object.entries(value);
  const firstEntry = entries[0];
  if (!firstEntry) {
    return { enabled: false, field: "applicantAge", operator: "gte", targetValue: "40" };
  }

  const [f, opObj] = firstEntry;
  if (opObj && typeof opObj === "object" && !Array.isArray(opObj)) {
    const opEntries = Object.entries(opObj as Record<string, unknown>);
    const firstOp = opEntries[0];
    if (firstOp) {
      return {
        enabled: true,
        field: f,
        operator: firstOp[0],
        targetValue: Array.isArray(firstOp[1]) ? firstOp[1].join(", ") : String(firstOp[1]),
      };
    }
  }

  return { enabled: true, field: f, operator: "eq", targetValue: String(opObj) };
}

export function AppliesWhenBuilder({ value, onChange }: AppliesWhenBuilderProps) {
  const currentRule = useMemo(() => parseRule(value), [value]);

  const updateRule = (newField: string, newOp: string, newVal: string, isEnabled = true) => {
    if (!isEnabled) {
      onChange(null);
      return;
    }

    let parsedVal: unknown = newVal.trim();
    if (newOp === "in") {
      parsedVal = newVal
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (!isNaN(Number(parsedVal)) && parsedVal !== "") {
      parsedVal = Number(parsedVal);
    }

    const rule = {
      [newField]: {
        [newOp]: parsedVal,
      },
    };
    onChange(rule);
  };

  const handleToggle = () => {
    if (currentRule.enabled) {
      onChange(null);
    } else {
      updateRule(currentRule.field, currentRule.operator, currentRule.targetValue, true);
    }
  };

  const getHumanReadableSummary = () => {
    const fieldObj = COMMON_FIELDS.find((f) => f.id === currentRule.field);
    const fieldLabel = fieldObj ? fieldObj.label : currentRule.field;
    const opObj = OPERATORS.find((o) => o.id === currentRule.operator);
    const opLabel = opObj ? opObj.label : currentRule.operator;

    return `Applies when: ${fieldLabel} ${opLabel} "${currentRule.targetValue}"`;
  };

  return (
    <div className="mt-2 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-semibold text-[#374151]">
          <Filter className="h-3.5 w-3.5 text-[#003366]" />
          <span>Conditional Requirement (Applies When)</span>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          className={`cursor-pointer rounded px-2 py-0.5 text-[11px] font-semibold transition-colors ${
            currentRule.enabled
              ? "bg-[#FCE8E6] text-[#C5221F] hover:bg-[#FAD2CF]"
              : "bg-[#EBF3FB] text-[#003366] hover:bg-[#D6E7FA]"
          }`}
        >
          {currentRule.enabled ? "Remove Condition (Always Required)" : "+ Add Condition"}
        </button>
      </div>

      {currentRule.enabled ? (
        <div className="mt-3 space-y-2.5">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {/* Field */}
            <div>
              <label className="mb-1 block text-[10px] font-bold text-[#6B7280] uppercase">
                Criteria Field
              </label>
              <select
                value={currentRule.field}
                onChange={(e) => {
                  updateRule(e.target.value, currentRule.operator, currentRule.targetValue, true);
                }}
                className="w-full rounded border border-[#D1D5DB] bg-white px-2 py-1.5 text-xs text-[#111827] focus:ring-1 focus:ring-[#003366] focus:outline-none"
              >
                {COMMON_FIELDS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Operator */}
            <div>
              <label className="mb-1 block text-[10px] font-bold text-[#6B7280] uppercase">
                Condition Operator
              </label>
              <select
                value={currentRule.operator}
                onChange={(e) => {
                  updateRule(currentRule.field, e.target.value, currentRule.targetValue, true);
                }}
                className="w-full rounded border border-[#D1D5DB] bg-white px-2 py-1.5 text-xs text-[#111827] focus:ring-1 focus:ring-[#003366] focus:outline-none"
              >
                {OPERATORS.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Value */}
            <div>
              <label className="mb-1 block text-[10px] font-bold text-[#6B7280] uppercase">
                Target Value
              </label>
              <input
                type="text"
                value={currentRule.targetValue}
                onChange={(e) => {
                  updateRule(currentRule.field, currentRule.operator, e.target.value, true);
                }}
                placeholder="e.g. 40 or commercial"
                className="w-full rounded border border-[#D1D5DB] bg-white px-2 py-1.5 text-xs text-[#111827] focus:ring-1 focus:ring-[#003366] focus:outline-none"
              />
            </div>
          </div>

          {/* Visual Badge Preview */}
          <div className="flex items-center gap-1.5 rounded-md border border-[#B3D4F5] bg-[#EBF3FB] px-2.5 py-1.5 text-[11px] font-medium text-[#003366]">
            <Info className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{getHumanReadableSummary()}</span>
          </div>
        </div>
      ) : (
        <p className="mt-1 text-[11px] text-[#6B7280]">
          Always required for all applicants (no conditional filters active).
        </p>
      )}
    </div>
  );
}
