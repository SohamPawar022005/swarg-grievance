import type { Scheme } from '@/data/schemesData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface SchemeApiRow {
  id: number;
  scheme_name: string;
  scheme_slug?: string | null;
  ministry?: string | null;
  department?: string | null;
  description?: string | null;
  benefits?: string | null;
  eligibility?: string | null;
  application_process?: string | null;
  documents_required?: string[] | string | null;
  scheme_type?: string | null;
  target_beneficiaries?: string[] | string | null;
  state?: string | null;
  website_url?: string | null;
  tags?: string[] | string | null;
}

const parseListField = (value?: string[] | string | null): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }
  return value
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseTags = (value?: string[] | string | null): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const toScheme = (row: SchemeApiRow): Scheme => ({
  id: String(row.id),
  scheme_name: row.scheme_name,
  scheme_slug: row.scheme_slug || '',
  ministry: row.ministry || '',
  department: row.department || '',
  description: row.description || '',
  benefits: row.benefits || '',
  eligibility: row.eligibility || '',
  application_process: row.application_process || '',
  documents_required: parseListField(row.documents_required),
  scheme_type: row.scheme_type || '',
  target_beneficiaries: parseListField(row.target_beneficiaries).join(', '),
  state: row.state || '',
  website_url: row.website_url || '',
  tags: parseTags(row.tags),
});

export const getAllSchemes = async (): Promise<Scheme[]> => {
  const response = await fetch(`${API_BASE_URL}/schemes?limit=5000`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch schemes');
  }

  const rows = (await response.json()) as SchemeApiRow[];
  return rows.map(toScheme);
};

export const getSchemesBatch = async (limit: number, offset: number): Promise<Scheme[]> => {
  const response = await fetch(`${API_BASE_URL}/schemes?limit=${limit}&offset=${offset}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch schemes batch');
  }

  const rows = (await response.json()) as SchemeApiRow[];
  return rows.map(toScheme);
};
