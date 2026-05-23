import { Loader2 } from 'lucide-react';

const Loader = ({ label = 'Loading' }) => (
  <div className="loader">
    <Loader2 className="spin" size={22} />
    <span>{label}</span>
  </div>
);

export default Loader;
