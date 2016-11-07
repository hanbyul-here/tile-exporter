import React from 'react';
import { render } from 'react-dom';

import Keys from './Keys';
import SearchBox from './Components/Search/SearchBox';
import TileExporter from './Components/TileExporter/Exporter';

require('./scss/main.scss');

const searchConfig = {
  placeholder: 'Search address or or place',
  childClass: 'searchBox',
  key: Keys.search
};

// Tile Exporter is not written as Reac Component
const tileExporter = new TileExporter();

function SearchBoxWrapper() {
  return (
    <div className="row">
      <div className="col-md-12">
        <SearchBox config={searchConfig} />
      </div>
    </div>
  );
}

render(<SearchBoxWrapper />, document.getElementById('search-bar'));
