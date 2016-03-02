import React from 'react'
import {debounce} from 'lodash';

import ResultRow from './ResultRow'
import ResultTable from './ResultTable'

import store from '../../Redux/Store'
import {updatePoint} from '../../Redux/Action'


var SearchBox = React.createClass({

  makeAutoCompleteCall: function(currentInput){

    var baseurl = 'https://search.mapzen.com/v1';

    var callurl = baseurl + '/autocomplete'+'?text=' + currentInput;
    callurl += '&api_key=' + this.props.config.key;

    var request = new XMLHttpRequest();
    request.open('GET', callurl, true);
    request.onload = () => {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        var resp = JSON.parse(request.responseText);
        this.setState({searchResult: resp.features})
      } else {
        // when there is no search result?
      }
    };

    request.onerror = function() {
      // when there is no search result / error?
    };

    request.send();
  },

  makeSearchCall: function(){

    var baseurl = 'https://search.mapzen.com/v1';

    var callurl = baseurl + '/search'+'?text=' + this.state.filterText;
    callurl += '&api_key=' + this.props.config.key;

    var request = new XMLHttpRequest();
    request.open('GET', callurl, true);
    request.onload = () => {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        var resp = JSON.parse(request.responseText);
        this.setState({searchResult: resp.features})
      } else {
        // when there is no search result?
      }
    };

    request.onerror = function() {
      // when there is no search result / error?
    };
    request.send();
  },


  componentWillMount: function() {
    //make search call debounce
    this.makeCall = debounce(function() {
      this.makeAutoCompleteCall.apply(this, [this.state.filterText]);
    }, 250);
  },

  getInitialState: function() {
    return {
      searchResult : [],
      dataIndex: -1,
      filterText: this.props.label || "",
      endpoint: 'autocomplete'
    };
  },

  componentDidMount: function(){
    this.refs.searchInput.focus();
  },

  handleKeyDown: function(event){
    var key = event.which || event.keyCode;
    var self = this;

    var currentDataIndex = this.state.dataIndex;

    switch(key) {
      case 13:
        console.log(currentDataIndex);
          if(currentDataIndex !== -1) {
            var data = self.state.searchResult[currentDataIndex];
            self.pointAction(data);
          } else {
            self.makeSearchCall();
          }
      case 38:
        currentDataIndex--;
        currentDataIndex += self.state.searchResult.length;
        currentDataIndex %= self.state.searchResult.length;
        break;
      case 40:
        currentDataIndex++;
        currentDataIndex %= self.state.searchResult.length;
        break;
    }

    this.setState({
      dataIndex: currentDataIndex
    })

    event.stopPropagation()
  },

  pointAction: function(data) {

    var selectedPoint = {
        name: data.properties.label,
        gid: data.properties.gid,
        lat: data.geometry.coordinates[1],
        lon: data.geometry.coordinates[0]
    };

    var latLon = {
      lat: data.geometry.coordinates[1],
      lon: data.geometry.coordinates[0]
    }

    store.dispatch(updatePoint(latLon));

    this.setInputValue(selectedPoint.name);
    this.setState({
      dataIndex: -1
    });

  },

  handleChange: function(){

    var currentType = this.refs.searchInput.value;
    if(currentType.length > 0) {
      var matchingVals = [];
      this.setState({
          filterText : currentType
        },this.makeCall());
      } else {
        this.setState({
          searchResult: [],
          filterText: "",
          dataIndex: -1
        })
    }
  },

  setInputValue: function(val) {
    this.setState({
      filterText : val
    },function(){
      this.deactivateSearching();
    });
  },

  deactivateSearching: function() {
    this.setState({
      searchTerm : [],
      searchResult: []
    });
  },

  render: function(){
    const { config } = this.props
    const { searchResult, dataIndex} = this.state
    return(
      <div class="searchBoxContainer">
        <div
          className="search-icon" />
        <input
          className = "form-control search-bar"
          placeholder = {config.placeholder}
          ref = "searchInput"
          type = "search"
          value = {this.state.filterText}
          onChange = {this.handleChange}
          onKeyDown = {this.handleKeyDown} />
        <ResultTable searchData = {searchResult}
                      dataIndex = {dataIndex}
                      centerPoint = {config.focusPoint}
                      pointAction = {this.pointAction} />
      </div>
    );
  }
});

module.exports = SearchBox;