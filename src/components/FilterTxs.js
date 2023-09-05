const FilterTxs = ({ setFilterBy }) => {
  return (
    <div className="filter-wrapper">
      <span className="filter-button">Show all</span>
      <div className="filter-dropdown">
        <p className="filter-dropdown__item" onClick={() => setFilterBy('all')}>
          Show all
        </p>
        <p className="filter-dropdown__item" onClick={() => setFilterBy('in')}>
          Show only in <span className="arrow-green">↑</span>
        </p>
        <p className="filter-dropdown__item" onClick={() => setFilterBy('out')}>
          Show only out ↓
        </p>
      </div>
    </div>
  )
};

export default FilterTxs;