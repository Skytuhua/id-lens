import { render } from 'preact';
import { App } from './components/App';
import './styles.css';

const mount = document.getElementById('app');
if (!mount) {
  throw new Error('Mount node #app not found');
}
render(<App />, mount);
