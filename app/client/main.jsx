import fs from 'fs';
import React from 'react';
import ReactDOM from 'react-dom';
import {MuiThemeProvider, RaisedButton, TextField} from 'material-ui';
import Draft, {Editor, EditorState, RichUtils, convertToRaw, getDefaultKeyBinding, KeyBindingUtil, Modifier} from 'draft-js';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();
const {hasCommandModifier} = KeyBindingUtil;

class GijirokuArea extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createEmpty()
    };
  }
  handleChange(editorState) {
    this.setState({editorState});
    this.props.buttonLayout(editorState.getCurrentInlineStyle().toArray());
  }
  handleKeyCommand(command) {
    switch (command) {
      case 'header':
        const selectionState = this.state.editorState.getSelection();
        const contentState = this.state.editorState.getCurrentContent();
        const startType = contentState.getBlockForKey(selectionState.getStartKey()).getType();
        const endType = contentState.getBlockForKey(selectionState.getEndKey()).getType();
        if (startType == endType) {
          switch (startType) {
            case 'unstyled':
              this.handleChange(RichUtils.toggleBlockType(this.state.editorState, 'header-two'));
              return true;
            case 'header-two':
              this.handleChange(RichUtils.toggleBlockType(this.state.editorState, 'header-three'));
              return true;
            case 'header-three':
              this.handleChange(RichUtils.toggleBlockType(this.state.editorState, 'header-four'));
              return true;
            default:
              break;
          }
        }
        break;
      default:
        const newState = RichUtils.handleKeyCommand(this.state.editorState, command);
        if (newState) {
          this.handleChange(newState);
          return true;
        }
        break;
    }
    return false;
  }
  sizeClicked(fontSize) {
  }
  boldClicked() {
    this.handleChange(RichUtils.toggleInlineStyle(this.state.editorState, 'BOLD'));
  }
  italicClicked() {
    this.handleChange(RichUtils.toggleInlineStyle(this.state.editorState, 'ITALIC'));
  }
  saveClicked() {
    fs.writeFile('content.json', JSON.stringify(convertToRaw(this.state.editorState.getCurrentContent()), null, '    '), (err) => {if (err) throw err;});
    const jsondata = JSON.parse(JSON.stringify(convertToRaw(this.state.editorState.getCurrentContent())));
    let output = '';
    let preblock = '';
    jsondata['blocks'].forEach((block) => {
      let temp = block['text'];
      const tasks = [];
      block['inlineStyleRanges'].forEach((inlineStyle) => {
        switch (inlineStyle['style']) {
          case 'BOLD':
            tasks.push({'str': '\'\'', 'place': inlineStyle['offset']});
            tasks.push({'str': '\'\'', 'place': inlineStyle['offset'] + inlineStyle['length']});
            break;
          case 'ITALIC':
            tasks.push({'str': '\'\'\'', 'place': inlineStyle['offset']});
            tasks.push({'str': '\'\'\'', 'place': inlineStyle['offset'] + inlineStyle['length']});
            break;
          default:
            break;
        }
      });
      tasks.sort((a, b) => {
        if (a.place > b.place) return -1;
        if (a.place < b.place) return 1;
        return 0;
      });
      tasks.forEach((task) => {
        temp = temp.slice(0, task.place) + task['str'] + temp.slice(task.place);
      });
      switch (block['type']) {
        case 'unstyled':
          temp += '~';
          if (preblock == 'unordered-list-item' || preblock == 'ordered-list-item') {
            temp = '\r\n' + temp;
          }
          preblock = 'unstyled';
          break;
        case 'unordered-list-item':
          temp = '-'.repeat(block['depth'] + 1) + ' ' + temp;
          preblock = 'unordered-list-item';
          break;
        case 'ordered-list-item':
          temp = '+'.repeat(block['depth'] + 1) + ' ' + temp;
          preblock = 'ordered-list-item';
          break;
        case 'header-two':
          temp = '* ' + temp;
          preblock = 'header-two';
          break;
        case 'header-three':
          temp = '** ' + temp;
          preblock = 'header-three';
          break;
        case 'header-four':
          temp = '*** ' + temp;
          preblock = 'header-four';
          break;
        default:
          console.log(block['type'] + ' undefined');
          preblock = '';
          break;
      }
      output += temp + '\r\n';
    });
    fs.writeFile('content.txt', output, (err) => {if (err) throw err;});
  }
  onTab(e) {
    switch (RichUtils.getCurrentBlockType(this.state.editorState)) {
      case 'unordered-list-item':
        this.handleChange(RichUtils.onTab(e, this.state.editorState, 2));
        break;
      case 'ordered-list-item':
        this.handleChange(RichUtils.onTab(e, this.state.editorState, 2));
        break;
      default:
        if (hasCommandModifier(e)) {
          this.handleChange(RichUtils.toggleBlockType(this.state.editorState, 'ordered-list-item'));
        } else {
          this.handleChange(RichUtils.toggleBlockType(this.state.editorState, 'unordered-list-item'));
        }
        break;
    }
    e.preventDefault();
  }
  render() {
    return (
      <div>
        <Editor 
          className='editor' 
          editorState={this.state.editorState} 
          onChange={this.handleChange.bind(this)} 
          handleKeyCommand={this.handleKeyCommand.bind(this)} 
          onTab={this.onTab.bind(this)} 
          blockStyleFn={myBlockStyleFn} 
          keyBindingFn={myKeyBindingFn} 
        />
      </div>
    );
  }
}

function myBlockStyleFn(contentBlock) {
  const type = contentBlock.getType();
  if (type === 'header-two') {
    return 'pukiH2';
  }
  if (type === 'header-three') {
    return 'pukiH3';
  }
  if (type === 'header-four') {
    return 'pukiH4';
  }
  if (type === 'code-block') {
    return 'pukiPre';
  }
}
function myKeyBindingFn(e) {
  if (e.nativeEvent.altKey) {
    return 'header';
  }
  /*
  if (e.keyCode == 32 || e.keyCode == 229) {
    if (e.nativeEvent.shiftKey) {
      return 'code';
    }
  }
  */
  return getDefaultKeyBinding(e);
}

class GijirokuMaker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      boldLayout: false,
      italicLayout: false,
      fontSize: 16
    };
  }
  sizeClicked() {
    this.refs.gijirokuArea.sizeClicked(this.state.fontSize);
  }
  boldClicked() {
    this.refs.gijirokuArea.boldClicked();
  }
  italicClicked() {
    this.refs.gijirokuArea.italicClicked();
  }
  saveClicked() {
    this.refs.gijirokuArea.saveClicked();
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
        <GijirokuArea ref='gijirokuArea' buttonLayout={this.buttonLayout.bind(this)} />
        <MuiThemeProvider>
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <div style={{margin: '0px 4px', display: 'none'}}><TextField id='sizeInput' value={this.state.fontSize} onChange={(e) => {this.sizeChanged(e)}} type='number' inputStyle={{textAlign: 'left'}} style = {{width: '35px'}} max={99} min={0}></TextField></div>
            <div style={{margin: '0px 4px', display: 'none'}}><RaisedButton label='Size' id='sizeButton' onMouseDown={(e) => {this.sizeClicked(); e.preventDefault()}} /></div>
            <div style={{margin: '0px 4px'}}><RaisedButton label='Bold' primary={this.state.boldLayout} id='boldButton'  onMouseDown={(e) => {this.boldClicked(); e.preventDefault()}} /></div>
            <div style={{margin: '0px 4px'}}><RaisedButton label='Italic' id='italicButton' primary={this.state.italicLayout} onMouseDown={(e) => {this.italicClicked(); e.preventDefault()}} /></div>
            <div style={{margin: '0px 4px'}}><RaisedButton label='Save' id='saveButton' onMouseDown={(e) => {this.saveClicked(); e.preventDefault()}} /></div>
          </div>
        </MuiThemeProvider>
      </div>
    );
  }
}

ReactDOM.render(
  <GijirokuMaker />,
  document.getElementById('container')
);
