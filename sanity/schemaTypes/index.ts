// sanity/schemaTypes/index.ts
// THIS is what sanity.config.ts imports. It was empty — now wired up.

import { type SchemaTypeDefinition } from 'sanity'
import { product }               from '../schemas/product'
import { series }                from '../schemas/series'
import { drop }                  from '../schemas/drop'
import { archiveTv, manuscript } from '../schemas/content'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [product, series, drop, archiveTv, manuscript],
}