// sanity/schemas/index.ts
// Used internally. schemaTypes/index.ts is what Sanity config actually reads.

import { product }               from './product'  // ← was "./product" (wrong folder)
import { series }                from './series'
import { drop }                  from './drop'
import { archiveTv, manuscript } from './content'

export const schemaTypes = [product, series, drop, archiveTv, manuscript]