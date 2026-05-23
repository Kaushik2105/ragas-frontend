import { motion } from 'framer-motion';

const PageHeader = ({ eyebrow, title, description, action }) => (
  <motion.header
    className="page-header"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
  >
    <div>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
    {action && <div className="page-action">{action}</div>}
  </motion.header>
);

export default PageHeader;
