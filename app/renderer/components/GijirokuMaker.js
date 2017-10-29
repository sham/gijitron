import React from 'react';
import {MuiThemeProvider, RaisedButton, TextField, CircularProgress} from 'material-ui';

import GijirokuArea from './GijirokuArea';


export default class GijirokuMaker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      boldLayout: false,
      italicLayout: false,
      fontSize: 16,
      saving: false,
      jsonSaved: false,
      txtSaved: false
    };
  }
  sizeClicked() {
    this.gijirokuArea.sizeClicked(this.state.fontSize);
  }
  boldClicked() {
    this.gijirokuArea.boldClicked();
  }
  italicClicked() {
    this.gijirokuArea.italicClicked();
  }
  saveClicked() {
    if (!(this.state.saving || this.state.jsonSaved || this.state.txtSaved)) {
      this.setState({
        saving: true,
        jsonSaved: false,
        txtSaved: false
      });
      this.gijirokuArea.saveClicked(this.saveCompleted.bind(this));
    }
  }
  saveCompleted(identifier) {
    if (identifier == 'json') {
      this.setState({jsonSaved: true});
    }
    if (identifier == 'txt') {
      this.setState({txtSaved: true});
    }
    if (this.state.jsonSaved && this.state.txtSaved) {
      this.setState({saving: false});
      setTimeout(() => {
        this.setState({
          saving: false,
          jsonSaved: false,
          txtSaved: false
        });
      }, 2000);
    }
  }
  openClicked() {
    this.gijirokuArea.openClicked();
  }
  buttonLayout(buttonLayout) {
    this.setState({
      boldLayout: buttonLayout.includes('BOLD'),
      italicLayout: buttonLayout.includes('ITALIC')
    });
  }
  sizeChanged(e) {
    this.setState({fontSize: e.target.value});
  }
  render() {
    return (
      <div id='reactroot'>
        <GijirokuArea ref={(ref) => this.gijirokuArea = ref} buttonLayout={this.buttonLayout.bind(this)} />
        <MuiThemeProvider>
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <div style={{margin: '0px 4px', display: 'none'}}><TextField id='sizeInput' value={this.state.fontSize} onChange={(e) => {this.sizeChanged(e);}} type='number' inputStyle={{textAlign: 'left'}} style = {{width: '35px'}} max={99} min={0}></TextField></div>
            <div style={{margin: '0px 4px', display: 'none'}}><RaisedButton label='Size' id='sizeButton' onMouseDown={(e) => {this.sizeClicked(); e.preventDefault();}} /></div>
            <div style={{margin: '0px 4px'}}><RaisedButton label='Bold' primary={this.state.boldLayout} id='boldButton'  onMouseDown={(e) => {this.boldClicked(); e.preventDefault();}} /></div>
            <div style={{margin: '0px 4px'}}><RaisedButton label='Italic' id='italicButton' primary={this.state.italicLayout} onMouseDown={(e) => {this.italicClicked(); e.preventDefault();}} /></div>
            <div style={{margin: '0px 4px'}}><RaisedButton label='Save' disabled={this.state.saving} backgroundColor={(this.state.jsonSaved && this.state.txtSaved) ? '#21BA45' : '#FFFFFF'} id='saveButton' onMouseDown={(e) => {this.saveClicked(); e.preventDefault();}} />
              {this.state.saving && <CircularProgress style={{position: 'absolute', marginLeft: -56, marginTop: 6}} size={24} />}</div>
            <div style={{margin: '0px 4px'}}><RaisedButton label='Open' id='openButton' onMouseDown={(e) => {this.openClicked(); e.preventDefault();}} /></div>
          </div>
        </MuiThemeProvider>
      </div>
    );
  }
}