import React, { PropTypes } from 'react';
import ResultRow from './ResultRow';

function ResultTable(props) {
  const listItem = props.searchData.map((searchResult, index) =>
    <ResultRow
      key={index}
      data={searchResult}
      rowIndex={index}
      dataIndex={props.dataIndex}
      pointAction={props.pointAction}
    />
  );

  return (
    <ul className="table-view search-table">
      {listItem}
    </ul>);
}

ResultTable.propTypes = {
  searchData: PropTypes.array, // eslint-disable-line
  dataIndex: PropTypes.number, // eslint-disable-line
  pointAction: PropTypes.func
};

export default ResultTable;
