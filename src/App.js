import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import FileInput from 'react-simple-file-input'
import svgToJsx from 'svg-to-jsx'
import FileDownload from 'js-file-download'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: null,
      files: [],
    }
  }

  showProgressBar = () => {
    this.setState({ progressBarVisible: true});
  }
 
  updateProgressBar = (event) => {
    this.setState({
      progressPercent: (event.loaded / event.total) * 100
    });
  }
 
  camelize = (str) => {
    return str.toLowerCase().replace(/(?:(^.)|(\s+.))/g, function(match) {
      return match.charAt(match.length-1).toUpperCase();
    }); 
  }

  handleDownload = (name, data) => {
    FileDownload(data, `${name}.js`)
  }

  handleFileSelected = async (event, file) => {
    
    try {

      const content = event.target.result
      const result = await svgToJsx(content)
      const heightRegex = /height="[0-9]+.[0-9]+px"/i
      const heightResult = result.match(heightRegex)
      const widthRegex = /width="[0-9]+.[0-9]+px"/i
      const widthResult = result.match(widthRegex)
      const numberRegex = /[0-9]+.[0-9]+/
      const width = parseFloat(widthResult[0].match(numberRegex)[0])
      const height = parseFloat(heightResult[0].match(numberRegex)[0])
      
      let svgStart = result.indexOf('<svg')
      let endTag = result.indexOf('>', svgStart)
      const noneStartResult = result.substring(endTag + 1)
      const resultContent = noneStartResult.replace('</svg>', '')
      const name = this.camelize(file.name.replace('.svg', ''))
      const reactGen = `
      // @flow
      import * as React from 'react'

      import {svg} from '../svg'

      class ${name} extends React.PureComponent<{}> {
        render() {
          return (
            <svg {...this.props}>
              ${resultContent}
            </svg>
          )
        }
      }

      export default svg(${name}, ${width}, ${height})
      `
      const files = this.state.files
      this.setState({files: [
        ...files,
        {
          name: name,
          file: file,
          content: reactGen,
        }
      ]});
    }
    catch (error) {
      console.log(error)
    }
    
  }

  render() {
    const {files} = this.state
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <div className="container">
          <FileInput
            readAs='text'
            multiple
            onLoadStart={this.showProgressBar}
            onLoad={this.handleFileSelected}
            onProgress={this.updateProgressBar}
          />
        </div> 
        {files.map((f, index) => {
          return (
            <div key={index} className="list">
              <h4>{f.name}</h4>
            <a className="copy-button" onClick={() => {this.handleDownload(f.name, f.content)}}>download</a>
            </div>
          )
        })}
      </div>
    );
  }
}

export default App;
