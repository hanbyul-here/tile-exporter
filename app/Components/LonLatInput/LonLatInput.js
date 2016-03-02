import React from 'react'

var LonLatInput = React.createClass({


  getInitialState: function() {
    return {
      searchResult : [],
      dataIndex: -1,
      filterText: this.props.label || ""
    };
  },

  componentDidMount: function(){
    this.refs.latInput.focus();
  },

  handleChange: function(event){
    console.log(event);
    // var currentType = this.refs.lonInput.value;
    // if(currentType.length > 0) {
    //   var matchingVals = [];
    //   this.setState({
    //       filterText : currentType
    //     },this.makeCall());
    //   } else {
    //     this.setState({
    //       searchResult: [],
    //       filterText : ""
    //     })
    // }
  },


  setInputValue: function(val) {
    this.setState({
      filterText : val
    });
  },

  render: function(){

    return(
      <div>
        <div className="form-group">
          <label for="lon">Longitude</label>
          <input type="text"
                className="form-control"
                id="lon"
                placeholder = "-74.0059700"
                ref = "lonInput"
                disabled = "true"/>
        </div>
        <div className="form-group">
          <label for="lat">Latitude</label>
          <input type="text"
                  className="form-control"
                  id="lat"
                  placeholder="40.7142700"
                  ref = "latInput"
                  disabled = "true"/>
        </div>
      </div>
    );
  }
});

module.exports = LonLatInput;