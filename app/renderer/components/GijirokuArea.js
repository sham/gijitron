import {remote, shell} from 'electron';
import path from 'path';
import fs from 'fs';
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {Editor, EditorState, RichUtils, convertToRaw, convertFromRaw, getDefaultKeyBinding, KeyBindingUtil} from 'draft-js';
const {hasCommandModifier} = KeyBindingUtil;


export default class GijirokuArea extends React.Component {
  constructor(props) {
    super(props);
    const date = moment().locale('ja');
    this.state = {
      editorState: EditorState.createEmpty(),
      eigen: date.format('YYYYMMDD_HHmmss')
    };
    const settingsPath = path.join(remote.app.getPath('userData'), '/gijiroku/.settings');
    fs.readFile(settingsPath, (err, data) => {
      if (err) {
        return false;
      }
      const settings = JSON.parse(data.toString()
        .replace(/YYYY/g, date.format('YYYY'))
        .replace(/MM/g, date.format('MM'))
        .replace(/DD/g, date.format('DD'))
        .replace(/ddd/g, date.format('ddd')));
      const updatedEditorState = EditorState.createWithContent(convertFromRaw(settings));
      if ('anchorBlock' in settings && 'anchorOffset' in settings) {
        const updatedSelectionState = updatedEditorState.getSelection().merge({
          anchorKey: settings['anchorBlock'],
          anchorOffset: settings['anchorOffset']
        });
        this.handleChange(EditorState.forceSelection(updatedEditorState, updatedSelectionState));
      } else {
        this.handleChange(updatedEditorState);
      }
      return true;
    });
  }
  componentDidMount() {
    this.editor.focus();
  }
  handleChange(editorState) {
    this.setState({editorState});
    this.props.buttonLayout(editorState.getCurrentInlineStyle().toArray());
  }
  handleKeyCommand(command) {
    const editorState = this.state.editorState;
    const selectionState = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const focusBlockType = contentState.getBlockForKey(selectionState.getFocusKey()).getType();
    switch (command) {
      case 'header': {
        switch (focusBlockType) {
          case 'unstyled': {
            this.handleChange(RichUtils.toggleBlockType(editorState, 'header-two'));
            return true;
          }
          case 'header-two': {
            this.handleChange(RichUtils.toggleBlockType(editorState, 'header-three'));
            return true;
          }
          case 'header-three': {
            this.handleChange(RichUtils.toggleBlockType(editorState, 'header-four'));
            return true;
          }
          default: {
            this.handleChange(RichUtils.toggleBlockType(editorState, 'header-two'));
            return true;
          }
        }
      }
      case 'soft-return': {
        if (['unordered-list-item', 'ordered-list-item'].includes(focusBlockType) && selectionState.isCollapsed()) {
          const newState = RichUtils.insertSoftNewline(editorState);
          if (newState) {
            this.handleChange(newState);
            return true;
          }
        }
        break;
      }
      default: {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
          this.handleChange(newState);
          return true;
        }
        break;
      }
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
  saveClicked(saveCompleted) {
    const curDir = path.join(remote.app.getPath('userData'), '/gijiroku');
    if (!fs.existsSync(curDir)) {
      fs.mkdirSync(curDir);
    }
    const contentJson = JSON.stringify(convertToRaw(this.state.editorState.getCurrentContent()),  null, '  ');
    fs.writeFile(path.join(curDir, `/${this.state.eigen}.json`), contentJson, (err) => {if (err) throw err; saveCompleted('json');});
    const contentObject = JSON.parse(contentJson);
    let output = '';
    let preblock = '';
    contentObject['blocks'].forEach((block) => {
      let text = block['text'];
      const tasks = [];
      block['inlineStyleRanges'].forEach((inlineStyle) => {
        switch (inlineStyle['style']) {
          case 'BOLD': {
            tasks.push({'str': '\'\'', 'place': inlineStyle['offset']});
            tasks.push({'str': '\'\'', 'place': inlineStyle['offset'] + inlineStyle['length']});
            break;
          }
          case 'ITALIC': {
            tasks.push({'str': '\'\'\'', 'place': inlineStyle['offset']});
            tasks.push({'str': '\'\'\'', 'place': inlineStyle['offset'] + inlineStyle['length']});
            break;
          }
          default: {
            break;
          }
        }
      });
      tasks.sort((a, b) => {
        if (a.place > b.place) return -1;
        if (a.place < b.place) return 1;
        return 0;
      });
      tasks.forEach((task) => {
        text = text.slice(0, task.place) + task['str'] + text.slice(task.place);
      });
      text = text.replace(/\n/g, '\r\n');
      switch (block['type']) {
        case 'unstyled': {
          if (text.match(/^(#|:)/) == null) {
            text += '~';
          }
          if (['unordered-list-item', 'ordered-list-item'].includes(preblock)) {
            text = '\r\n' + text;
          }
          break;
        }
        case 'unordered-list-item': {
          text = '-'.repeat(block['depth'] + 1) + ' ' + text.replace(/\r\n/g, '~\r\n');
          break;
        }
        case 'ordered-list-item': {
          text = '+'.repeat(block['depth'] + 1) + ' ' + text.replace(/\r\n/g, '~\r\n');
          break;
        }
        case 'header-two': {
          text = '* ' + text;
          break;
        }
        case 'header-three': {
          text = '** ' + text;
          break;
        }
        case 'header-four': {
          text = '*** ' + text;
          break;
        }
        case 'code-block': {
          text = ' ' + text;
          break;
        }
        default: {
          // console.log(block['type'] + ' undefined');
          break;
        }
      }
      output += text + '\r\n';
      preblock = block['type'];
    });
    fs.writeFile(path.join(curDir, `/${this.state.eigen}.txt`), output, (err) => {if (err) throw err; saveCompleted('txt');});
  }
  openClicked() {
    const curDir = path.join(remote.app.getPath('userData'), '/gijiroku');
    if (!fs.existsSync(curDir)) {
      fs.mkdirSync(curDir);
    }
    shell.openExternal(curDir);
  }
  onTab(e) {
    const editorState = this.state.editorState;
    switch (RichUtils.getCurrentBlockType(editorState)) {
      case 'unordered-list-item': {
        this.handleChange(RichUtils.onTab(e, editorState, 2));
        break;
      }
      case 'ordered-list-item': {
        this.handleChange(RichUtils.onTab(e, editorState, 2));
        break;
      }
      default: {
        if (hasCommandModifier(e)) {
          this.handleChange(RichUtils.toggleBlockType(editorState, 'ordered-list-item'));
        } else {
          this.handleChange(RichUtils.toggleBlockType(editorState, 'unordered-list-item'));
        }
        break;
      }
    }
    e.preventDefault();
  }
  handleDroppedFiles(selection, files) {
    const filePath = files[0].path;
    if (filePath.match(/\.json$/i) != null) {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          return 'not-handled';
        }
        const parsedData = JSON.parse(data.toString());
        const updatedEditorState = EditorState.createWithContent(convertFromRaw(parsedData));
        this.handleChange(updatedEditorState);
        const date = moment().locale('ja');
        this.setState({eigen: date.format('YYYYMMDD_HHmmss')});
        return 'handled';
      });
    }
  }
  render() {
    return (
      <Editor 
        ref={(ref) => this.editor = ref} 
        editorState={this.state.editorState} 
        onChange={this.handleChange.bind(this)} 
        handleKeyCommand={this.handleKeyCommand.bind(this)} 
        onTab={this.onTab.bind(this)} 
        blockStyleFn={myBlockStyleFn} 
        keyBindingFn={myKeyBindingFn} 
        handleDroppedFiles={this.handleDroppedFiles.bind(this)}
      />
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
  if (e.nativeEvent.shiftKey) {
    if (e.keyCode == 13) {
      return 'soft-return';
    }
  }
  return getDefaultKeyBinding(e);
}
GijirokuArea.propTypes = {
  buttonLayout: PropTypes.func.isRequired
};