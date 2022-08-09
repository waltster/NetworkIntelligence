/**
 *
 * Copyright 2022, University of South Carolina. All rights reserved.
 * Released under the license found in LICENSE.md.
 *
 * @date 9 August 2022
 * @author Walter Pach <walterdpach@gmail.com>
 */
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  mode: 'development',
  entry: './src/client/index.js',
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'dist')
  }
}
