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
