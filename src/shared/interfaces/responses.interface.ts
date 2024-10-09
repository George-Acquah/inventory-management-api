import { _ITokens } from './jwt_payload.interface';
import { _ISafeUser } from './users.interface';

export interface _ILoginResponse<T = _ISafeUser> {
  user: T;
  tokens: _ITokens;
}

export interface _ILookup {
  from: string;
  foreignField: string;
  as: string;
  localField?: string;
}

/**
 * PaginationMeta Interface
 *
 * This interface defines the structure of pagination metadata.
 */
export interface _IPaginationMeta {
  /**
   * The total number of items available.
   */
  totalItems: number;

  /**
   * The total number of pages available.
   */
  totalPages: number;

  /**
   * The current page number.
   */
  currentPage: number;

  /**
   * The number of items per page.
   */
  itemsPerPage: number;
}
