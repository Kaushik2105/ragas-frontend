import { Music } from 'lucide-react';

const EmptyState = ({ title = 'Nothing here yet', message = 'Once data appears, this space will come alive.' }) => (
  <div className="empty-state">
    <Music size={28} />
    <h3>{title}</h3>
    <p>{message}</p>
  </div>
);

export default EmptyState;
