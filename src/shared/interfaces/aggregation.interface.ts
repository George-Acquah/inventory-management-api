export interface _ILookup {
  from: string;
  foreignField: string;
  as: string;
  localField?: string;
}

export interface _IAggregationFields<T> {
  /** test */
  lookups?: _ILookup[];
  deepLookups?: _ILookup[];
  finalLookups?: _ILookup[];
  unwind_fields?: (keyof T)[];
  deep_unwind_fields?: string[];
  final_unwind_fields?: string[];
  project_fields?: (keyof T)[];
  count_fields?: string[];
  field_names?: string[];
}
