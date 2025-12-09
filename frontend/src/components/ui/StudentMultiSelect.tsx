import React from "react";

export interface StudentOption {
  id: string;
  name: string;
  email: string;
}

interface Props {
  options: StudentOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
}

export const StudentMultiSelect: React.FC<Props> = ({ options, selected, onChange }) => {
  return (
    <div className="border rounded p-2 max-h-48 overflow-y-auto bg-white">
      {options.length === 0 && <div className="text-muted-foreground">No students found.</div>}
      {options.map((student) => (
        <div key={student.id} className="flex items-center gap-2 mb-1">
          <input
            type="checkbox"
            checked={selected.includes(student.id)}
            onChange={(e) => {
              if (e.target.checked) {
                onChange([...selected, student.id]);
              } else {
                onChange(selected.filter((id) => id !== student.id));
              }
            }}
          />
          <span className="font-medium">{student.name}</span>
          <span className="text-xs text-muted-foreground">({student.email})</span>
        </div>
      ))}
    </div>
  );
};
