import * as fixme from 'fixme'

import { dir } from './shared'

fixme({
    path: dir.src,
    file_patterns: ['**/*.ts'],
    file_encoding: ['utf8'],
    line_length_limit: 200,
})
