import PropTypes from 'prop-types';

const InlineLoader = ({ className }) => (
  <div className={`inline-loader ${className || ''}`}>
    <div />
    <div />
    <div />
    <div />
  </div>
);

export default InlineLoader;

InlineLoader.propTypes = {
  className: PropTypes.string,
};
