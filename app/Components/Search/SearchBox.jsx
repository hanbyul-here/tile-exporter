import React, { Component, PropTypes } from 'react';
import { debounce } from 'lodash';

import ResultTable from './ResultTable';

import store from '../../Redux/Store';
import { updatePoint } from '../../Redux/Action';


class SearchBox extends Component {
  constructor(props) {
    super(props);
    this.baseurl = 'https://search.mapzen.com/v1';
    this.state = {
      searchResult: [],
      dataIndex: -1,
      filterText: this.props.label || ''
    };
  }

  componentWillMount() {
    // Make a debounced autocomplete call function so it can be used with keyboard event
    this.makeAutoCompleteCall = debounce(function () {
      this.makeNotDebouncedAutoCompleteCall.apply(this, [this.state.filterText]);
    }, 250);
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.pointAction = this.pointAction.bind(this);
  }

  componentDidMount() {
    this.searchInput.focus();
  }

  setInputValue(val) {
    this.setState({
      filterText: val
    }, () => this.deactivateSearching());
  }

  makeNotDebouncedAutoCompleteCall() {
    const callurl = `${this.baseurl}/autocomplete?text=${this.state.filterText}&api_key=${this.props.config.key}`;
    this.makePeliasCall(callurl);
  }

  makeSearchCall() {
    const callurl = `${this.baseurl}/search?text=${this.state.filterText}&api_key=${this.props.config.key}`;
    this.makePeliasCall(callurl);
  }

  makePeliasCall(callurl) {
    const request = new XMLHttpRequest();
    request.open('GET', callurl, true);
    request.onload = () => {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        const resp = JSON.parse(request.responseText);
        this.setState({ searchResult: resp.features });
      } else {
        // when there is no search result?
      }
    };

    request.onerror = function () {
      // when there is no search result / error?
    };
    request.send();
  }

  handleKeyDown(event) {
    const key = event.which || event.keyCode;
    // var self = this;

    let currentDataIndex = this.state.dataIndex;

    switch (key) {
      case 13:
        if (currentDataIndex !== -1) {
          this.pointAction(this.state.searchResult[currentDataIndex]);
        } else {
          this.makeSearchCall();
        }
        break;
      case 38:
        currentDataIndex -= 1;
        currentDataIndex += this.state.searchResult.length;
        currentDataIndex %= this.state.searchResult.length;
        break;
      case 40:
        currentDataIndex += 1;
        currentDataIndex %= this.state.searchResult.length;
        break;
      default:
        break;
    }

    this.setState({
      dataIndex: currentDataIndex
    });

    event.stopPropagation();
  }


  handleChange(event) {
    const currentType = event.target.value;
    if (currentType.length > 0) {
      this.setState({
        filterText: currentType
      }, this.makeAutoCompleteCall());
    } else {
      this.setState({
        searchResult: [],
        filterText: '',
        dataIndex: -1
      });
    }
  }

  pointAction(data) {
    const selectedPoint = {
      name: data.properties.label,
      gid: data.properties.gid,
      lat: data.geometry.coordinates[1],
      lon: data.geometry.coordinates[0]
    };

    store.dispatch(updatePoint(selectedPoint));

    this.setInputValue(selectedPoint.name);
    this.setState({
      dataIndex: -1
    });

    document.getElementById('exportBtn').disabled = false;
    document.getElementById('lon').innerHTML = selectedPoint.lon;
    document.getElementById('lat').innerHTML = selectedPoint.lat;
  }

  deactivateSearching() {
    this.setState({
      searchTerm: [],
      searchResult: []
    });
  }

  render() {
    const { config } = this.props;
    const { searchResult, dataIndex } = this.state;
    return (
      <div className="searchBoxContainer">
        <div className="search-icon" />
        <input
          className="form-control search-bar"
          placeholder={config.placeholder}
          ref={(input) => this.searchInput = input} // eslint-disable-line
          type="search"
          value={this.state.filterText}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
        />
        <ResultTable
          searchData={searchResult}
          dataIndex={dataIndex}
          pointAction={this.pointAction}
        />
      </div>
    );
  }
}

SearchBox.propTypes = {
  config: PropTypes.object, // eslint-disable-line
  label: PropTypes.string
};

export default SearchBox;
