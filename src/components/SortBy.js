import chevronArrow from '../assets/chevron-arrow.svg';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export default function SortBy({ onChange = () => {} }) {
  const [sort, setSort] = useState({
    param: 'time',
    direction: 'descending',
  });

  useEffect(() => {
    onChange(sort);
  }, [sort, onChange]);

  function clickHandler(param) {
    if (sort.param === param && sort.direction === 'descending') {
      setSort({ param, direction: 'ascending' });
    } else {
      setSort({ param, direction: 'descending' });
    }
  }

  return (
    <div className='sort-by'>
      <h3 className='sort-by__heading'>Sort by:</h3>

      {['time', 'amount'].map((param) => {
        const isActive = sort.param === param;
        const isAscending = isActive && sort.direction === 'ascending';

        return (
          <button
            key={param}
            className={`sort-by__button ${
              isActive ? 'sort-by__button_active' : ''
            }`}
            onClick={() => clickHandler(param)}
          >
            {param}
            <img
              src={chevronArrow}
              className={`${isAscending ? 'arrow-up' : ''}`}
              alt={'arrow'}
            />
          </button>
        );
      })}
    </div>
  );
}

SortBy.propTypes = {
  onChange: PropTypes.func,
};
