import PropTypes from "prop-types";

const options = [
  {
    value: 'all',
    element: 'Show all'
  },
  {
    value: 'in',
    element: (
      <span>
        Show only in <span className="arrow-green">↓</span>
      </span>
    )
  },
  {
    value: 'out',
    element: 'Show only out ↑'
  },
]

const FilterTxs = ({ setFilterBy, selectedFilter }) => {
  return (
    <div className="filter-wrapper">
      <span className="filter-button">{options.find((el) => el.value === selectedFilter).element}</span>
      <div className="filter-dropdown">
        {options.map((el) => (
          <p key={el.value} className="filter-dropdown__item" onClick={() => setFilterBy(el.value)}>
            {el.element}
          </p>
        ))}
      </div>
    </div>
  )
};

FilterTxs.propTypes = {
  setFilterBy: PropTypes.func,
  selectedFilter: PropTypes.string,
};

export default FilterTxs;