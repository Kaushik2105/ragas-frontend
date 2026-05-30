import logo from '../../assets/ragas-logo.png';

const AppLogo = ({ size = 'md', showText = true, className = '' }) => (
  <span className={`app-logo app-logo-${size} ${className}`.trim()}>
    <span className="brand-mark logo-mark">
      <img src={logo} alt="RAGAS logo" />
    </span>
    {showText && <span>RAGAS</span>}
  </span>
);

export default AppLogo;
