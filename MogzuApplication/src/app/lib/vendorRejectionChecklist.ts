export type RejectionReasonCategory =
  | 'Incomplete Information'
  | 'Policy Violation'
  | 'Pricing Issue'
  | 'Low Quality Content'
  | 'Duplicate Listing'
  | 'Incorrect Category'
  | 'Missing Media'
  | 'Other';

export type ChecklistRow = { ok: boolean; text: string };

export function getChecklistForCategory(category: RejectionReasonCategory): ChecklistRow[] {
  switch (category) {
    case 'Incomplete Information':
      return [
        { ok: false, text: 'Listing title is too short (minimum 10 characters)' },
        { ok: false, text: 'Description is missing or under 100 words' },
        { ok: false, text: 'Group size minimum and maximum not specified' },
        { ok: false, text: 'Duration options not added' },
        { ok: true, text: 'Category is correctly set' },
      ];
    case 'Missing Media':
      return [
        { ok: false, text: 'At least 3 images are required' },
        { ok: false, text: 'Cover image must be landscape (min 800×500px)' },
        { ok: true, text: 'Title and description are complete' },
      ];
    case 'Pricing Issue':
      return [
        { ok: false, text: 'Base price appears to be unrealistically low' },
        { ok: false, text: 'Add-on prices are missing' },
        { ok: true, text: 'Pricing type is correctly selected' },
      ];
    case 'Low Quality Content':
      return [
        { ok: false, text: 'Description contains placeholder text' },
        { ok: false, text: 'Images appear to be stock photos — use real photos' },
        { ok: false, text: 'Title is generic — be more specific about what makes this listing unique' },
      ];
    case 'Policy Violation':
      return [
        { ok: false, text: 'Listing violates Mogzu content guidelines' },
        { ok: false, text: 'Review guidelines link below before resubmitting' },
      ];
    case 'Duplicate Listing':
    case 'Incorrect Category':
    case 'Other':
    default:
      return [
        { ok: false, text: 'Review all listing fields for completeness' },
        { ok: false, text: 'Ensure all images meet quality standards' },
        { ok: false, text: 'Verify pricing is accurate and competitive' },
      ];
  }
}

export function getReasonPillClass(category: RejectionReasonCategory): string {
  const map: Record<RejectionReasonCategory, string> = {
    'Incomplete Information': 'bg-orange-100 text-orange-800 border border-orange-200',
    'Policy Violation': 'bg-red-100 text-red-800 border border-red-200',
    'Pricing Issue': 'bg-amber-100 text-amber-900 border border-amber-200',
    'Low Quality Content': 'bg-slate-100 text-slate-800 border border-slate-200',
    'Duplicate Listing': 'bg-blue-100 text-blue-800 border border-blue-200',
    'Incorrect Category': 'bg-violet-100 text-violet-800 border border-violet-200',
    'Missing Media': 'bg-slate-100 text-slate-700 border border-slate-200',
    Other: 'bg-slate-100 text-slate-700 border border-slate-200',
  };
  return map[category] ?? map.Other;
}
