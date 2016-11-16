import React, { PropTypes } from 'react';

function ResultRow(props) {
  const { data, dataIndex, rowIndex, pointAction } = props;
  return (
    <li  // eslint-disable-line
      role="button"
      className={(dataIndex === rowIndex) ? 'select table-view-cell search-result' : 'table-view-cell search-result'}
      onClick={() => pointAction(data)}
    >
      {data.properties.label}
    </li>
  );
}

ResultRow.propTypes = {
  data: PropTypes.object, // eslint-disable-line
  dataIndex: PropTypes.number,
  rowIndex: PropTypes.number,
  pointAction: PropTypes.func
};

export default ResultRow;
