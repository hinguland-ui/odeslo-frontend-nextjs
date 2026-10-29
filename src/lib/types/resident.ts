export interface Resident {
  id: number;
  society_id: number;
  wing_id: number;
  unit_id: number;
  name: string;
  mobile: string;
  email: string | null;
  resident_type: "owner" | "tenant" | "family" | string;
  is_primary: boolean;
  parent_resident_id: number | null;
  photo: string | null;
  status: "pending_approval" | "active" | "rejected" | "deactivated" | string;
  unit_occupied_flag: boolean;
  rejection_reason: string | null;
  approved_at: string | null;
  emergency_contact_name: string | null;
  emergency_contact_mobile: string | null;
  maintenance_visible: boolean;
  created_at: string;
  wing_name: string | null;
  unit_no: string | null;
}

export interface ResidentDocument {
  id: number;
  doc_type: string;
  file_path: string;
  status: string;
}

export interface ResidentDetail extends Resident {
  documents: ResidentDocument[];
  family_members: { id: number; name: string; relation: string; mobile: string | null }[];
  vehicles: { id: number; vehicle_type: string; vehicle_number: string; parking_slot: string | null }[];
  occupied_by: Resident | null;
}
