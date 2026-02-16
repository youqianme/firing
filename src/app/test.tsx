import { Currency } from '../types';

const test: Currency = 'CNY';

console.log('Test:', test);

export default function TestPage() {
  return <div>Test: {test}</div>;
}
