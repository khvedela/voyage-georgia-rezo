import common from './common';
import pages from './pages';
import data from './data';
import schema from './schema';
import builder from './builder';
import studio from './studio';

/** The English dictionary is the source of truth: its shape is the type every other language must match. */
const en = { common, pages, data, schema, builder, studio };
export default en;
