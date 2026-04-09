export interface InspectionRow {
  id: string;
  inspectionNumber: string;
  facilityName: string;
  facilityLocation: string | null;
  inspectionType: string;
  inspectionDate: string;
  status: string;
  overallResult: string;
  description: string | null;
  notes: string | null;
  scheduledAt: string | null;
  completedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string;
  inspector: {
    id: string;
    name: string | null;
    email: string;
  };
  items: InspectionItemRow[];
}

export interface InspectionItemRow {
  id: string;
  category: string;
  checkItem: string;
  result: string;
  priority: string | null;
  correctiveAction: string | null;
  actionParty: string | null;
  remarks: string | null;
}

export const INSPECTION_TYPES = [
  "HSE and Quality Inspection",
  "Visual Inspection",
  "NDT (Non-Destructive Testing)",
  "Pressure Test",
  "Coating Inspection",
  "Corrosion Assessment",
  "Structural Integrity",
  "Electrical Systems",
  "Safety Equipment",
  "Environmental Compliance",
  "General Audit",
] as const;

export const INSPECTION_CATEGORIES = [
  "Spills, Preparedness and Response",
  "Secondary Containment Areas",
  "Island / Fuel Area",
  "General Work Areas",
  "Safety",
  "First Aid",
  "Electrical Safety",
  "Tools and Equipment",
  "Overhead Cranes and Lifting Gear",
  "Hazardous Chemicals - Work Shops",
  "Chemical Storage Areas / Tank Farms",
  "Waste Handling and Storage",
  "Wash Bay / Wash Area",
  "Pressure Testing Areas",
  "Storage Systems for Products",
  "Security Control",
  "Signage",
  "Parking Areas",
  "Landscaping and Grounds",
  "Facility and Infrastructure",
  "Entries, Exits, Walkways and Stairs",
  "Reception and Office Areas",
  "Food and Coffee Area",
  "Legal & Government",
  "Utilities",
  "Housekeeping, Sanitation and Hygiene",
  "Emergency Operations",
  "Fire Protection",
  "Locker Room / Washrooms / Break Areas",
  "Laboratory",
  "Quality Checklist",
] as const;

export const PRIORITY_LEVELS = ["High", "Medium", "Low"] as const;

export function generateInspectionNumber(): string {
  const now = new Date();
  const year = String(now.getFullYear()).slice(2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `FQI-${year}${month}-${random}`;
}
